from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from .service import ConfigAlertaService

from typing import List

from .schemas import ConfigAlertaItem
from app.models.usuario import Usuario
from app.modules.auth.security import get_current_user

router = APIRouter(
    prefix="/config-alertas",
    tags=["Configuração de Alertas"],
)

service = ConfigAlertaService()


@router.get("")
def listar(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return service.listar(
        db,
        usuario.id,
    )
    
@router.post("")
def salvar(
    configuracoes: List[ConfigAlertaItem],
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return service.salvar(
        db,
        usuario.id,
        configuracoes,
    )