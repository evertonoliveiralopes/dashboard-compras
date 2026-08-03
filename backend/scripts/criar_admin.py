from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.modules.auth.security import gerar_hash_senha


def criar_admin():
    db: Session = SessionLocal()

    try:
        email = "admin@compra360.com"

        usuario = (
            db.query(Usuario)
            .filter(Usuario.email == email)
            .first()
        )

        if usuario:
            print("Usuário administrador já existe.")
            return

        admin = Usuario(
            nome="Administrador",
            email=email,
            senha_hash=gerar_hash_senha("Admin@123"),
            ativo=True,
            administrador=True,
        )

        db.add(admin)
        db.commit()

        print("Administrador criado com sucesso!")

    finally:
        db.close()


if __name__ == "__main__":
    criar_admin()