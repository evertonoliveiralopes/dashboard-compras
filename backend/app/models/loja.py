from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Loja(Base):
    __tablename__ = "lojas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), unique=True, nullable=False)
    nome = Column(String(100), nullable=False)
    unidade = Column(String(100), nullable=False)
    ativo = Column(Boolean, nullable=False, default=True)

    produtos = relationship("ProdutoLoja", back_populates="loja")

    vendas = relationship("Venda", back_populates="loja")
    entradas = relationship("Entrada", back_populates="loja")
    historico_importacoes = relationship(
        "HistoricoImportacao",
        back_populates="loja"
    )
    config_alertas = relationship(
        "ConfigAlerta",
        back_populates="loja"
    )
