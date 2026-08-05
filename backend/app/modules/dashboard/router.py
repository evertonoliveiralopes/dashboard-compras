from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from .service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

service = DashboardService()


@router.get("/indicadores")
def indicadores(db: Session = Depends(get_db)):
    return service.indicadores(db)

@router.get("/compras-mes")
def compras_mes(db: Session = Depends(get_db)):
    return service.compras_por_mes(db)

@router.get("/top-fornecedores")
def top_fornecedores(db: Session = Depends(get_db)):
    return service.top_fornecedores(db)

@router.get("/compras-departamento")
def compras_por_departamento(db: Session = Depends(get_db)):
    return service.compras_por_departamento(db)

@router.get("/alertas")
def alertas(db: Session = Depends(get_db)):
    return service.alertas(db)

@router.get("/ultimas-importacoes")
def ultimas_importacoes(db: Session = Depends(get_db)):
    return service.ultimas_importacoes(db)