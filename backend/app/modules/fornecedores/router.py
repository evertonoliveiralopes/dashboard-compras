from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.fornecedores.service import ler_arquivo
from app.modules.fornecedores.importador import importar_dataframe



router = APIRouter(
    prefix="/fornecedores",
    tags=["Fornecedores"],
)


@router.post("/importar")
async def importar_fornecedores(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    df = ler_arquivo(arquivo)

    print(df.columns.tolist())
    print(df.head())
    
    from app.models.fornecedor import Fornecedor
    
    print("COLUNAS DO MODEL:")
    for coluna in Fornecedor.__table__.columns:
        print(coluna.name, coluna.type)
        
    print(df[df["cnpj"].duplicated(keep=False)].sort_values("cnpj"))
    
    resultado = importar_dataframe(df, db)

    return {
        "arquivo": arquivo.filename,
        **resultado,
    }