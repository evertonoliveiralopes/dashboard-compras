from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database import Base


class ConfigTipoAlerta(Base):

    __tablename__ = "config_tipos_alertas"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    alteracao_preco = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    estoque_minimo = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    sem_movimentacao = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    usuario = relationship(
        "Usuario",
        back_populates="config_tipo_alerta",
    )