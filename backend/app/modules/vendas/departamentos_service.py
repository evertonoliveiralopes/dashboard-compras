from sqlalchemy.orm import Session

from app.models.departamento import Departamento


def listar_departamentos(db: Session):

    return (
        db.query(Departamento)
        .order_by(Departamento.descricao)
        .all()
    )