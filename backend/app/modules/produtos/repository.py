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

    return (
        query
        .order_by(Produto.descricao)
        .offset(offset)
        .limit(limit)
        .all()
    )