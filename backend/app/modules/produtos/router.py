from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from .service import ProdutoService

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
    return service.importar(arquivo, db)