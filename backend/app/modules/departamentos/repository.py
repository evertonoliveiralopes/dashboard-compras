from sqlalchemy.orm import Session

from app.models.departamento import Departamento


class DepartamentoRepository:

    def buscar_por_codigo(self, db: Session, codigo: str):
        return (
            db.query(Departamento)
            .filter(Departamento.codigo == codigo)
            .first()
        )