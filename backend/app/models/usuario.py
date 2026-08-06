from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base
from sqlalchemy.orm import relationship

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(150), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    senha_hash = Column(String(255), nullable=False)

    ativo = Column(Boolean, default=True, nullable=False)

    administrador = Column(Boolean, default=False, nullable=False)

    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    atualizado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    config_alertas = relationship(
        "ConfigAlerta",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )