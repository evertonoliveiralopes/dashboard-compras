from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.produto import Produto
from app.models.produto_loja import ProdutoLoja


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
    loja_id: int | None = None,
):

    query = db.query(
        Produto,
        func.coalesce(
            ProdutoLoja.custo, 0
        ).label("custo"),
        func.coalesce(
            ProdutoLoja.preco_venda, 0
        ).label("preco_venda"),
        func.coalesce(
            ProdutoLoja.estoque_atual, 0
        ).label("estoque"),
        func.coalesce(
            ProdutoLoja.estoque_trocas, 0
        ).label("estoque_trocas"),
    ).outerjoin(
        ProdutoLoja,
        (ProdutoLoja.produto_id == Produto.id)
        & (
            ProdutoLoja.loja_id == loja_id
        ),
    )

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

    resultado = []

    for produto, custo, preco_venda, estoque, estoque_trocas in items:
        resultado.append(
            {
                "id": produto.id,
                "codigo": produto.codigo,
                "descricao": produto.descricao,
                "departamento": produto.departamento,
                "custo": custo,
                "preco_venda": preco_venda,
                "estoque": estoque,
                "estoque_trocas": estoque_trocas,
                "status": produto.status,
            }
        )

    return {
        "items": resultado,
        "total": total,
    }