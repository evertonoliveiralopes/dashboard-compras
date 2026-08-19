from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from typing import List




from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    Query,
)


from app.database import get_db

from .service import ProdutoService
from .schemas import ProdutoResponse

router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"],
)

service = ProdutoService()


@router.post("/importar")
async def importar_produtos(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    return service.importar(
        arquivo,
        db,
    )


@router.get(
    "",
    response_model=list[ProdutoResponse],
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
    db: Session = Depends(get_db),
):

    return service.listar(
        db=db,
        busca=busca,
        departamento=departamento,
        status=status,
        offset=offset,
        limit=limit,
    )