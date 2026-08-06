from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database import Base


class ConfigAlerta(Base):
    __tablename__ = "config_alertas"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    departamento_id = Column(
        Integer,
        ForeignKey("departamentos.id"),
        nullable=False,
    )

    ativo = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    usuario = relationship(
        "Usuario",
        back_populates="config_alertas",
    )

    departamento = relationship(
        "Departamento",
        back_populates="config_alertas",
    )