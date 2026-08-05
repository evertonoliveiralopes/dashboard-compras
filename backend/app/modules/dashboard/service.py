from sqlalchemy.orm import Session

from .repository import DashboardRepository


class DashboardService:
    
    def __init__(self):
        self.repository = DashboardRepository()
        

    def indicadores(self, db: Session):
        return {
            "compras": self.repository.total_compras(db),
            "produtos": self.repository.total_produtos(db),
            "fornecedores": self.repository.total_fornecedores(db),
            "estoque": 0,
        }
        
    def compras_por_mes(self, db: Session):
        return self.repository.compras_por_mes(db)
    
    def top_fornecedores(self, db: Session):
        return self.repository.top_fornecedores(db)
    def compras_por_departamento(self, db: Session):
        return self.repository.compras_por_departamento(db)
    def alertas(self, db: Session):
        return self.repository.alertas(db)
    def ultimas_importacoes(self, db: Session):
        return self.repository.ultimas_importacoes(db)