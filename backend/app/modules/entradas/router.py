from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.loja import Loja
from app.modules.entradas.importador import importar_arquivo
from app.modules.entradas.service import (
    listar_entradas_service,
    detalhar_entrada_service,
)


router = APIRouter(
    prefix="/entradas",
    tags=["Entradas"],
)


@router.post("/importar")
def importar_entradas(
    loja_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):
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

    return importar_arquivo(
        arquivo,
        db,
        loja_id,
    )


@router.get("/")
def listar_entradas(
    loja_id: int | None = None,
    db: Session = Depends(get_db),
):
    return listar_entradas_service(
        db,
        loja_id,
    )


@router.get("/{entrada_id}")
def detalhar_entrada(
    entrada_id: int,
    loja_id: int | None = None,
    db: Session = Depends(get_db),
):
    retorno = detalhar_entrada_service(
        db,
        entrada_id,
        loja_id,
    )

    if retorno is None:
        return {
            "erro": "Entrada não encontrada"
        }

    return retorno