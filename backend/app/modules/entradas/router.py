from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.entradas.importador import importar_arquivo
from fastapi import APIRouter, Depends
from app.modules.entradas.service import listar_entradas_service
from app.modules.entradas.service import detalhar_entrada_service



router = APIRouter(
    prefix="/entradas",
    tags=["Entradas"],
)


@router.post("/importar")
def importar_entradas(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    return importar_arquivo(
        arquivo,
        db,
    )
    
@router.get("/")
def listar_entradas(
    db: Session = Depends(get_db),
):
    return listar_entradas_service(db)

@router.get("/{entrada_id}")
def detalhar_entrada(
    entrada_id: int,
    db: Session = Depends(get_db),
):

    retorno = detalhar_entrada_service(
        db,
        entrada_id,
    )

    if retorno is None:
        return {
            "erro": "Entrada não encontrada"
        }

    return retorno