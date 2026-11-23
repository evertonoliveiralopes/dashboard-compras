from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.departamento import Departamento
from app.models.loja import Loja
from app.models.usuario import Usuario
from app.modules.auth.security import get_current_user
from app.modules.config_alertas.service import ConfigAlertaService

from .service import montar_radar


router = APIRouter(
    prefix="/radar",
    tags=["Radar do Comprador"],
)
config_alertas = ConfigAlertaService()


@router.get("")
def consultar_radar(
    loja_id: int = Query(gt=0),
    departamento: str | None = Query(None, min_length=1, max_length=20),
    usuario: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    loja = db.query(Loja).filter(Loja.id == loja_id, Loja.ativo.is_(True)).first()
    if loja is None:
        raise HTTPException(status_code=404, detail="Loja ativa não encontrada.")

    configuracoes = config_alertas.listar(db, usuario.id)
    consulta = db.query(Departamento.codigo, Departamento.descricao)
    if configuracoes:
        ids_ativos = {item.departamento_id for item in configuracoes if item.ativo}
        consulta = consulta.filter(Departamento.id.in_(ids_ativos))

    departamentos = [
        {"codigo": codigo, "descricao": descricao}
        for codigo, descricao in consulta.order_by(Departamento.descricao, Departamento.codigo)
    ]
    codigos = [item["codigo"] for item in departamentos]
    departamento_aplicado = departamento if departamento in codigos else None
    filtro = {
        "monitoramento_configurado": bool(configuracoes),
        "departamentos": departamentos,
        "departamento_aplicado": departamento_aplicado,
    }

    if configuracoes and not codigos:
        return {"filtro": filtro}

    if departamento_aplicado is not None:
        codigos = [departamento_aplicado]
    elif not configuracoes:
        codigos = []

    tipos_alerta = config_alertas.listar_tipos(db, usuario.id)
    percentual_minimo = tipos_alerta["percentual_alteracao_preco"]
    return {
        **montar_radar(db, loja, codigos, percentual_minimo),
        "filtro": filtro,
    }
