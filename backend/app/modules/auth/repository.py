from sqlalchemy.orm import Session

from app.models.usuario import Usuario


class AuthRepository:

    def buscar_por_email(
        self,
        db: Session,
        email: str,
    ) -> Usuario | None:

        return (
            db.query(Usuario)
            .filter(Usuario.email == email)
            .first()
        )

    def criar_usuario(
        self,
        db: Session,
        usuario: Usuario,
    ) -> Usuario:

        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        return usuario