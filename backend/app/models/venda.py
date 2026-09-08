from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey

from sqlalchemy.orm import relationship

from app.database import Base


class Venda(Base):
    __tablename__ = "vendas"

    id = Column(Integer, primary_key=True, index=True)

    empresa = Column(String(20), nullable=False, index=True)

    data = Column(Date, nullable=False, index=True)

    codigo_produto = Column(String(30), nullable=False, index=True)

    descricao = Column(String(255))

    unidade = Column(String(20))

    qtde_embalagem = Column(Numeric(12, 3))

    quantidade = Column(Numeric(12, 3))

    valor_unitario = Column(Numeric(14, 4))

    valor_total = Column(Numeric(14, 2))

    custo_unitario = Column(Numeric(14, 4))

    custo_total = Column(Numeric(14, 2))

    margem = Column(Numeric(10, 2))

    loja_id = Column(Integer, ForeignKey("lojas.id"), nullable=True)

    loja = relationship("Loja", back_populates="vendas")
