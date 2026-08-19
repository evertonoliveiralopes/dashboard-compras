from sqlalchemy.orm import Session

from app.models.produto import Produto


def buscar_por_codigo(db: Session, codigo: str):

    return (
        db.query(Produto)
        .filter(Produto.codigo == codigo)
        .first()
    )


def listar_produtos(
    db: Session,
    busca: str | None = None,
    departamento: str | None = None,
    status: int | None = None,
    offset: int = 0,
    limit: int = 50,
):

    query = db.query(Produto)

    if busca:
        query = query.filter(
            (Produto.codigo.ilike(f"%{busca}%"))
            | (Produto.descricao.ilike(f"%{busca}%"))
        )

    if departamento:
        query = query.filter(
            Produto.departamento == departamento
        )

    if status is not None:
        query = query.filter(
            Produto.status == status
        )

    total = query.count()

    items = (
        query
        .order_by(Produto.descricao)
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "items": items,
        "total": total,
    }