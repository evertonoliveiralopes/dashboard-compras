from sqlalchemy import func
from app.models.venda import Venda


def faturamento_produtos(
    db,
    empresa=None,
    data_inicio=None,
    data_fim=None,
    limit=50,
):

    query = db.query(
        Venda.codigo_produto,
        Venda.descricao,
        func.sum(Venda.valor_total).label("faturamento"),
        func.sum(Venda.quantidade).label("quantidade"),
    )

    if empresa:
        query = query.filter(
            func.upper(Venda.empresa) == empresa.upper()
        )

    if data_inicio:
        query = query.filter(Venda.data >= data_inicio)

    if data_fim:
        query = query.filter(Venda.data <= data_fim)

    return (
        query.group_by(
            Venda.codigo_produto,
            Venda.descricao,
        )
        .order_by(
            func.sum(Venda.valor_total).desc()
        )
        .limit(limit)
        .all()
    )