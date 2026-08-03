from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class MapeamentoImportacao(Base):
    __tablename__ = "mapeamentos_importacao"

    id = Column(Integer, primary_key=True, index=True)

    perfil_id = Column(
        Integer,
        ForeignKey("perfis_importacao.id"),
        nullable=False
    )

    campo = Column(String(50), nullable=False)

    coluna = Column(String(150), nullable=False)

    perfil = relationship("PerfilImportacao")