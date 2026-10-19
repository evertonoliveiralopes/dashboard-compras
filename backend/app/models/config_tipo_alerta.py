from sqlalchemy import Column, Integer, Boolean, ForeignKey, Numeric, text
from sqlalchemy.orm import relationship

from app.database import Base


class ConfigTipoAlerta(Base):
    __tablename__ = "config_tipos_alertas"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False,
    )

    alteracao_preco = Column(Boolean, default=True, nullable=False)
    estoque_minimo = Column(Boolean, default=False, nullable=False)
    sem_movimentacao = Column(Boolean, default=True, nullable=False)

    percentual_alteracao_preco = Column(
        Numeric(5, 2),
        nullable=False,
        default=10,
        server_default=text("10.00"),
    )

    quantidade_minima_estoque = Column(
        Numeric(10, 3),
        nullable=False,
        default=20,
        server_default=text("20.000"),
    )

    dias_sem_venda = Column(
        Integer,
        nullable=False,
        default=30,
        server_default=text("30"),
    )

    usuario = relationship(
        "Usuario",
        back_populates="config_tipo_alerta",
    )
