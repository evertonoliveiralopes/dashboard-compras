from sqlalchemy.orm import Session

from .repository import DashboardRepository


class DashboardService:
    
    def __init__(self):
        self.repository = DashboardRepository()
        

    def indicadores(self, db: Session, loja_id=None):
        return {
            "compras": self.repository.total_compras(db, loja_id),
            "produtos": self.repository.total_produtos(db),
            "fornecedores": self.repository.total_fornecedores(db),
            "estoque": self.repository.total_valor_estoque(db),
        }
        
    def compras_por_mes(self, db: Session, loja_id=None):
        return self.repository.compras_por_mes(db, loja_id)
    
    def top_fornecedores(self, db: Session, loja_id=None):
        return self.repository.top_fornecedores(db, loja_id)

    def compras_por_departamento(self, db: Session, loja_id=None):
        return self.repository.compras_por_departamento(db, loja_id)
    def alertas(self, db: Session):
        return self.repository.alertas(db)
    def ultimas_importacoes(self, db: Session):
        return self.repository.ultimas_importacoes(db)