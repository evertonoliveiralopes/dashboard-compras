from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario

from app.modules.auth.schemas import (
    LoginRequest,
    TokenResponse,
    UsuarioResponse,
)
from app.modules.auth.security import get_current_user
from app.modules.auth.service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
)

service = AuthService()


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    dados: LoginRequest,
    db: Session = Depends(get_db),
):
    return service.autenticar(
        db,
        dados.email,
        dados.senha,
    )


@router.get(
    "/me",
    response_model=UsuarioResponse,
)
def me(
    usuario: Usuario = Depends(get_current_user),
):
    return usuario