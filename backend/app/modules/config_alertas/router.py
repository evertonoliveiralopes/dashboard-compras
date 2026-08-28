from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.modules.auth.security import get_current_user

from .service import ConfigAlertaService
from .schemas import ConfigAlertaItem, ConfigTipoAlertaSchema

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
    configuracoes: list[ConfigAlertaItem],
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return service.salvar(
        db,
        usuario.id,
        configuracoes,
    )


@router.get("/tipos")
def listar_tipos(
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return service.listar_tipos(
        db,
        usuario.id,
    )


@router.post("/tipos")
def salvar_tipos(
    configuracao: ConfigTipoAlertaSchema,
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return service.salvar_tipos(
        db,
        usuario.id,
        configuracao,
    )