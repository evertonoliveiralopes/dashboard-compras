from sqlalchemy import Column, Integer, Float, ForeignKey, String, Date
from sqlalchemy.orm import relationship

from app.database import Base


class ItemEntrada(Base):

    __tablename__ = "itens_entrada"

    id = Column(Integer, primary_key=True, index=True)

    entrada_id = Column(
        Integer,
        ForeignKey("entradas.id")
    )

    produto_id = Column(
        Integer,
        ForeignKey("produtos.id")
    )


    quantidade = Column(Float)

    custo = Column(Float)

    custo_nota = Column(Float)


    descricao_produto = Column(String)

    condicao_pagamento = Column(String)

    validade = Column(Date)

    tipo_embalagem = Column(String)

    bonificacao = Column(String)


    produto = relationship(
        "Produto",
        back_populates="entradas"
    )


    entrada = relationship(
        "Entrada",
        back_populates="itens"
    )