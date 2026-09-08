from fastapi import APIRouter, UploadFile, File, Depends
import pandas as pd
from .service import faturamento_produtos
from .filtros_service import listar_lojas
from datetime import date
from .departamentos_service import listar_departamentos
from app.models.historico_importacao import HistoricoImportacao
from app.models.loja import Loja
from app.database import get_db
from sqlalchemy.orm import Session

from .importador import importar_dataframe

router = APIRouter(prefix="/vendas", tags=["Vendas"])


@router.post("/importar")
async def importar_vendas(
    loja_id: int,
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

    loja = db.query(Loja).filter(
        Loja.id == loja_id,
        Loja.ativo.is_(True),
    ).first()

    if not loja:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail="Loja não encontrada ou inativa",
        )

    resultado = importar_dataframe(
        df,
        db,
        loja_id,
        arquivo.filename,
    )

    historico = HistoricoImportacao(
        tipo="Vendas",
        loja_id=loja_id,
        arquivo=arquivo.filename,
        registros=len(df),
        inseridos=resultado.get("inseridos", 0),
        atualizados=resultado.get("atualizados", 0),
        erros=resultado.get("erros", 0),
        status="SUCESSO",
    )

    db.add(historico)
    db.commit()

    return resultado
@router.get("/faturamento")
def obter_faturamento(
    loja_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):

    dados = faturamento_produtos(
        db=db,
        loja_id=loja_id,
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
            "id": loja.id,
            "codigo": loja.codigo,
            "nome": loja.nome,
            "unidade": loja.unidade,
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