from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
from .service import faturamento_produtos
from .filtros_service import listar_lojas
from datetime import date
from .departamentos_service import listar_departamentos

from app.database import get_db
from sqlalchemy.orm import Session

from .importador import importar_dataframe

router = APIRouter(prefix="/vendas", tags=["Vendas"])


@router.post("/importar")
async def importar_vendas(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if arquivo.filename.endswith(".csv"):
        df = pd.read_csv(
            arquivo.file,
            sep=";",
            encoding="latin1",
            low_memory=False,
        )
    else:
        df = pd.read_excel(arquivo.file)

    return importar_dataframe(df, db, "LOJA 1")

@router.get("/faturamento")
def obter_faturamento(
    empresa: str | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):

    dados = faturamento_produtos(
        db=db,
        empresa=empresa,
        data_inicio=data_inicio,
        data_fim=data_fim,
        limit=limit,
    )

    return [
        {
            "codigo": item.codigo_produto,
            "descricao": item.descricao,
            "faturamento": float(item.faturamento or 0),
            "quantidade": float(item.quantidade or 0),
        }
        for item in dados
    ]
    
@router.get("/lojas")
def obter_lojas(
    db: Session = Depends(get_db),
    ):

        lojas = listar_lojas(db)

        return [
            {
                "codigo": loja.empresa,
                "descricao": loja.empresa,
            }
            for loja in lojas
        ]

@router.get("/departamentos")
def obter_departamentos(
    db: Session = Depends(get_db),
):

    departamentos = listar_departamentos(db)

    return [
        {
            "id": departamento.id,
            "codigo": departamento.codigo,
            "descricao": departamento.descricao,
        }
        for departamento in departamentos
    ]