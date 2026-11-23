from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def gerar_hash_senha(senha: str) -> str:
    return pwd_context.hash(senha)


def verificar_senha(senha: str, senha_hash: str) -> bool:
    return pwd_context.verify(senha, senha_hash)


def criar_token(dados: dict):
    dados_token = dados.copy()

    expira = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    dados_token.update({"exp": expira})

    return jwt.encode(
        dados_token,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:

    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        usuario_id = payload.get("id")
        if type(usuario_id) is not int or usuario_id < 1:
            raise credenciais_invalidas

    except JWTError:
        raise credenciais_invalidas

    usuario = db.get(Usuario, usuario_id)

    if usuario is None or not usuario.ativo:
        raise credenciais_invalidas

    return usuario


def exigir_administrador(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if not usuario.administrador:
        raise HTTPException(status_code=403, detail="Esta área é restrita a administradores.")
    return usuario
