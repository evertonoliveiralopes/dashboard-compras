from sqlalchemy import Column, Integer, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class ProdutoLoja(Base):
    __tablename__ = "produtos_lojas"

    id = Column(Integer, primary_key=True, index=True)

    produto_id = Column(
        Integer,
        ForeignKey("produtos.id"),
        nullable=False,
    )

    loja_id = Column(
        Integer,
        ForeignKey("lojas.id"),
        nullable=False,
    )

    custo = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    preco_venda = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    estoque_atual = Column(
        Numeric(10, 3),
        nullable=False,
        default=0,
    )

    estoque_trocas = Column(
        Numeric(10, 3),
        nullable=False,
        default=0,
    )

    produto = relationship(
        "Produto",
        back_populates="lojas",
    )

    loja = relationship(
        "Loja",
        back_populates="produtos",
    )

    __table_args__ = (
        UniqueConstraint(
            "produto_id",
            "loja_id",
            name="uq_produtos_lojas_produto_loja",
        ),
    )
