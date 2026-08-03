from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class HistoricoImportacao(Base):
    __tablename__ = "historico_importacao"

    id = Column(Integer, primary_key=True, index=True)

    tipo = Column(String(50), nullable=False)

    arquivo = Column(String(200), nullable=False)

    registros = Column(Integer, default=0)

    inseridos = Column(Integer, default=0)

    atualizados = Column(Integer, default=0)

    erros = Column(Integer, default=0)

    status = Column(String(30), default="SUCESSO")

    criado_em = Column(DateTime(timezone=True), server_default=func.now())