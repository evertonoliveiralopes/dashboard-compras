from sqlalchemy import Column, Integer, String

from app.database import Base


class Departamento(Base):
    __tablename__ = "departamentos"

    id = Column(Integer, primary_key=True, index=True)

    codigo = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    descricao = Column(
        String(150),
        nullable=False,
    )