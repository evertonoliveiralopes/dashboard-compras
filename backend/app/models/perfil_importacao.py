from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class PerfilImportacao(Base):
    __tablename__ = "perfis_importacao"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(100), nullable=False)

    tipo = Column(String(50), nullable=False)

    descricao = Column(String(200))

    ativo = Column(Boolean, default=True)

    criado_em = Column(DateTime(timezone=True), server_default=func.now())