from sqlalchemy import distinct

from app.models.venda import Venda


def listar_lojas(db):
    return (
        db.query(Venda.empresa)
        .distinct()
        .order_by(Venda.empresa)
        .all()
    )