from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from .service import ConfigAlertaService

from typing import List

from .schemas import ConfigAlertaItem

router = APIRouter(
    prefix="/config-alertas",
    tags=["Configuração de Alertas"],
)

service = ConfigAlertaService()


@router.get("/{usuario_id}")
def listar(usuario_id: int, db: Session = Depends(get_db)):

    return service.listar(
        db,
        usuario_id,
    )
    
@router.post("/{usuario_id}")
def salvar(
    usuario_id: int,
    configuracoes: List[ConfigAlertaItem],
    db: Session = Depends(get_db),
):

    return service.salvar(
        db,
        usuario_id,
        configuracoes,
    )