from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import TokenResponse
from app.modules.auth.security import (
    criar_token,
    verificar_senha,
)


class AuthService:

    def __init__(self):
        self.repository = AuthRepository()

    def autenticar(
        self,
        db: Session,
        email: str,
        senha: str,
    ) -> TokenResponse:

        usuario = self.repository.buscar_por_email(
            db,
            email,
        )

        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos.",
            )

        if not usuario.ativo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário desativado.",
            )

        if not verificar_senha(
            senha,
            usuario.senha_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos.",
            )

        token = criar_token(
            {
                "sub": usuario.email,
                "id": usuario.id,
                "nome": usuario.nome,
                "administrador": usuario.administrador,
            }
        )

        return TokenResponse(
            access_token=token
        )