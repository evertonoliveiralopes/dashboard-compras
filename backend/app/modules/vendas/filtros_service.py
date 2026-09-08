from app.models.loja import Loja


def listar_lojas(db):
    return (
        db.query(Loja)
        .filter(Loja.ativo.is_(True))
        .order_by(Loja.id)
        .all()
    )
