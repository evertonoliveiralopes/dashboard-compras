from sqlalchemy import Column, Integer, Date, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Entrada(Base):
    __tablename__ = "entradas"

    id = Column(Integer, primary_key=True, index=True)

    empresa = Column(Integer)

    data_entrada = Column(Date)

    fornecedor_id = Column(Integer, ForeignKey("fornecedores.id"))

    nota_fiscal = Column(String)

    chave_nfe = Column(String)

    lancamento_fiscal = Column(String)

    processo_entrada = Column(String)

    tipo_movimento = Column(String)


    fornecedor = relationship(
        "Fornecedor",
        back_populates="entradas"
    )


    itens = relationship(
        "ItemEntrada",
        back_populates="entrada"
    )