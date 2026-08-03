from sqlalchemy.orm import Session

from app.models.produto import Produto


def buscar_por_codigo(db: Session, codigo: str):

    return (
        db.query(Produto)
        .filter(Produto.codigo == codigo)
        .first()
    )