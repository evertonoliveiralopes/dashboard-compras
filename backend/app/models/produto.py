from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship


from app.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)

    codigo = Column(String(30), unique=True, nullable=False)

    descricao = Column(String(200), nullable=False)

    departamento = Column(String(20))  

    custo = Column(Numeric(10, 2), default=0)

    preco_venda = Column(Numeric(10, 2), default=0)

    estoque = Column(Numeric(10, 3), default=0)

    estoque_minimo = Column(Numeric(10, 3), default=0)

    status = Column(Integer, default=0)


    # Histórico de entradas desse produto
    entradas = relationship(
        "ItemEntrada",
        back_populates="produto"
    )
    
   