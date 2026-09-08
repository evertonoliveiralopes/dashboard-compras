from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from .service import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

service = DashboardService()


@router.get("/indicadores")
def indicadores(loja_id: int | None = Query(None), db: Session = Depends(get_db)):
    return service.indicadores(db, loja_id)

@router.get("/compras-mes")
def compras_mes(loja_id: int | None = Query(None), db: Session = Depends(get_db)):
    return service.compras_por_mes(db, loja_id)

@router.get("/top-fornecedores")
def top_fornecedores(loja_id: int | None = Query(None), db: Session = Depends(get_db)):
    return service.top_fornecedores(db, loja_id)

@router.get("/compras-departamento")
def compras_por_departamento(loja_id: int | None = Query(None), db: Session = Depends(get_db)):
    return service.compras_por_departamento(db, loja_id)

@router.get("/alertas")
def alertas(db: Session = Depends(get_db)):
    return service.alertas(db)

@router.get("/ultimas-importacoes")
def ultimas_importacoes(db: Session = Depends(get_db)):
    return service.ultimas_importacoes(db)