from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from .schemas import ProdutoResponse, ProdutosPaginadosResponse

from typing import List




from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    Query,
)


from app.database import get_db
from app.models.loja import Loja
from fastapi import HTTPException

from .service import ProdutoService
from .schemas import ProdutoResponse

router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"],
)

service = ProdutoService()


@router.post("/importar")
async def importar_produtos(
    loja_id: int,
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    loja = db.query(Loja).filter(
        Loja.id == loja_id,
        Loja.ativo.is_(True),
    ).first()

    if not loja:
        raise HTTPException(
            status_code=404,
            detail="Loja não encontrada ou inativa",
        )

    return service.importar(
        arquivo,
        db,
        loja_id,
    )


@router.get(
    "",
    response_model=ProdutosPaginadosResponse,
)
def listar_produtos(
    busca: str | None = Query(
        default=None
    ),
    departamento: str | None = Query(
        default=None
    ),
    status: int | None = Query(
        default=None
    ),
    offset: int = Query(
        default=0,
        ge=0
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=100
    ),
    loja_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):

    return service.listar(
        db=db,
        busca=busca,
        departamento=departamento,
        status=status,
        offset=offset,
        limit=limit,
        loja_id=loja_id,
    )