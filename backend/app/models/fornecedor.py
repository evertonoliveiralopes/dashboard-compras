from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Fornecedor(Base):
    __tablename__ = "fornecedores"

    id = Column(Integer, primary_key=True, index=True)

    codigo = Column(String(30), unique=True, nullable=False)

    razao_social = Column(String(150), nullable=False)

    nome_fantasia = Column(String(150))

    cnpj = Column(String(18), unique=True)

    telefone = Column(String(30))

    email = Column(String(150))

    ativo = Column(Boolean, default=True)


    # Todas as entradas desse fornecedor
    entradas = relationship(
        "Entrada",
        back_populates="fornecedor"
    )