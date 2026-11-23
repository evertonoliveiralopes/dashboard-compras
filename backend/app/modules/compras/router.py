from datetime import date, timedelta
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, PositiveInt
from sqlalchemy import Numeric, cast, func, literal, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.departamento import Departamento
from app.models.entrada import Entrada
from app.models.fornecedor import Fornecedor
from app.models.item_entrada import ItemEntrada
from app.models.loja import Loja
from app.models.produto import Produto
from app.modules.auth.security import get_current_user

router = APIRouter(
    prefix="/compras",
    tags=["Compras"],
    dependencies=[Depends(get_current_user)],
)

Visao = Literal["produtos", "notas", "empresas", "departamentos", "compradores"]


class ConsultaCompras(BaseModel):
    visao: Visao = "notas"
    loja_id: PositiveInt | None = None
    departamento_id: int | None = Field(default=None, ge=0)
    data_inicio: date | None = None
    data_fim: date | None = None
    busca: str = Field(default="", max_length=120)
    pagina: int = Field(default=1, ge=1)
    por_pagina: int = Field(default=25, ge=1, le=100)


def entradas_da_loja(consulta, loja_id):
    if loja_id is not None:
        consulta = consulta.filter(Entrada.loja_id == loja_id)
    return consulta


def nome_fornecedor():
    return func.coalesce(func.nullif(Fornecedor.nome_fantasia, ""), Fornecedor.razao_social)


def valor_item():
    return cast(ItemEntrada.quantidade, Numeric) * cast(ItemEntrada.custo, Numeric)


def periodo_consulta(db, filtros):
    inicio, fim = filtros.data_inicio, filtros.data_fim
    if inicio and fim and inicio > fim:
        raise HTTPException(status_code=422, detail="A data inicial deve ser anterior ou igual à final.")
    if inicio is None and fim is None:
        fim = entradas_da_loja(db.query(func.max(Entrada.data_entrada)), filtros.loja_id).scalar()
        if fim:
            inicio = fim - timedelta(days=29)
    return inicio, fim


def linhas_compras(db, filtros, inicio, fim):
    fornecedor = nome_fornecedor()
    produto = func.coalesce(
        func.nullif(Produto.descricao, ""), func.nullif(ItemEntrada.descricao_produto, "")
    )
    consulta = (
        db.query(
            Entrada.id.label("entrada_id"),
            Entrada.nota_fiscal.label("nota"),
            Entrada.data_entrada.label("data"),
            Entrada.loja_id.label("loja_id"),
            Entrada.empresa.label("empresa_codigo"),
            Loja.nome.label("loja"),
            Loja.unidade.label("unidade"),
            Entrada.fornecedor_id.label("fornecedor_id"),
            fornecedor.label("fornecedor"),
            ItemEntrada.id.label("item_id"),
            Produto.id.label("produto_id"),
            Produto.codigo.label("codigo"),
            produto.label("produto"),
            Departamento.id.label("departamento_id"),
            Departamento.descricao.label("departamento"),
            cast(ItemEntrada.quantidade, Numeric).label("quantidade"),
            valor_item().label("valor"),
        )
        .select_from(Entrada)
        .outerjoin(Loja, Loja.id == Entrada.loja_id)
        .outerjoin(Fornecedor, Fornecedor.id == Entrada.fornecedor_id)
        .outerjoin(ItemEntrada, ItemEntrada.entrada_id == Entrada.id)
        .outerjoin(Produto, Produto.id == ItemEntrada.produto_id)
        .outerjoin(Departamento, Departamento.codigo == Produto.departamento)
    )
    consulta = entradas_da_loja(consulta, filtros.loja_id)
    if inicio is not None:
        consulta = consulta.filter(Entrada.data_entrada >= inicio)
    if fim is not None:
        consulta = consulta.filter(Entrada.data_entrada <= fim)
    if filtros.departamento_id == 0:
        consulta = consulta.filter(ItemEntrada.id.is_not(None), Departamento.id.is_(None))
    elif filtros.departamento_id is not None:
        consulta = consulta.filter(Departamento.id == filtros.departamento_id)
    if busca := filtros.busca.strip():
        consulta = consulta.filter(or_(
            Entrada.nota_fiscal.icontains(busca, autoescape=True),
            fornecedor.icontains(busca, autoescape=True),
            Fornecedor.codigo.icontains(busca, autoescape=True),
            Produto.codigo.icontains(busca, autoescape=True),
            produto.icontains(busca, autoescape=True),
            ItemEntrada.descricao_produto.icontains(busca, autoescape=True),
        ))
    return consulta.subquery()


def montar_visao(db, linhas, visao):
    campos = linhas.c
    valor = func.sum(campos.valor).label("valor")
    notas = func.count(func.distinct(campos.entrada_id)).label("notas")
    itens = func.count(campos.item_id).label("itens")
    fornecedores = func.count(func.distinct(campos.fornecedor_id)).label("fornecedores")
    if visao == "notas":
        grupo = (
            campos.entrada_id, campos.nota, campos.data, campos.loja,
            campos.unidade, campos.empresa_codigo, campos.fornecedor,
        )
        return db.query(*grupo, itens, valor).group_by(*grupo).order_by(
            campos.data.desc().nulls_last(), campos.entrada_id.desc()
        )
    if visao == "produtos":
        grupo = (campos.produto_id, campos.codigo, campos.produto)
        quantidade = func.sum(campos.quantidade).label("quantidade")
        quantidade_com_custo = func.sum(campos.quantidade).filter(campos.valor.is_not(None))
        custo_medio = (valor / func.nullif(quantidade_com_custo, 0)).label("custo_medio")
        return db.query(*grupo, quantidade, custo_medio, valor).filter(
            campos.item_id.is_not(None)
        ).group_by(*grupo).order_by(
            valor.desc().nulls_last(), campos.produto, campos.produto_id
        )
    if visao == "empresas":
        grupo = (campos.loja_id, campos.empresa_codigo, campos.loja, campos.unidade)
        return db.query(*grupo, notas, fornecedores, valor).group_by(*grupo).order_by(
            valor.desc().nulls_last(), campos.loja_id, campos.empresa_codigo
        )
    if visao == "departamentos":
        grupo = (campos.departamento_id, campos.departamento)
        produtos = func.count(func.distinct(campos.produto_id)).label("produtos")
        return db.query(*grupo, produtos, valor).filter(campos.item_id.is_not(None)).group_by(
            *grupo
        ).order_by(valor.desc().nulls_last(), campos.departamento_id)

    # O layout de entradas importado atualmente não contém comprador.
    return db.query(literal("Sem comprador informado").label("comprador"), notas, itens, valor).having(
        notas > 0
    )


@router.get("")
def consultar_compras(
    filtros: Annotated[ConsultaCompras, Query()],
    db: Session = Depends(get_db),
):
    inicio, fim = periodo_consulta(db, filtros)
    linhas = linhas_compras(db, filtros, inicio, fim)
    campos = linhas.c
    resumo = db.query(
        func.sum(campos.valor).label("valor"),
        func.count(func.distinct(campos.entrada_id)).label("notas"),
        func.count(func.distinct(campos.produto_id)).label("produtos"),
        func.count(func.distinct(campos.fornecedor_id)).label("fornecedores"),
    ).one()

    consulta = montar_visao(db, linhas, filtros.visao)
    total = consulta.order_by(None).count()
    registros = consulta.offset((filtros.pagina - 1) * filtros.por_pagina).limit(
        filtros.por_pagina
    ).all()
    return {
        "periodo": {"inicio": inicio, "fim": fim},
        "resumo": dict(resumo._mapping),
        "total": total,
        "registros": [dict(linha._mapping) for linha in registros],
    }


@router.get("/notas/{entrada_id}")
def consultar_nota(entrada_id: PositiveInt, db: Session = Depends(get_db)):
    nota = (
        db.query(
            Entrada.nota_fiscal.label("nota"),
            Entrada.data_entrada.label("data"),
            Entrada.empresa.label("empresa_codigo"),
            Loja.nome.label("loja"),
            Loja.unidade.label("unidade"),
            nome_fornecedor().label("fornecedor"),
        )
        .select_from(Entrada)
        .outerjoin(Loja, Loja.id == Entrada.loja_id)
        .outerjoin(Fornecedor, Fornecedor.id == Entrada.fornecedor_id)
        .filter(Entrada.id == entrada_id)
        .one_or_none()
    )
    if nota is None:
        raise HTTPException(status_code=404, detail="Nota fiscal não encontrada.")

    itens = (
        db.query(
            ItemEntrada.id,
            Produto.codigo,
            func.coalesce(Produto.descricao, ItemEntrada.descricao_produto).label("produto"),
            ItemEntrada.quantidade,
            ItemEntrada.custo,
            valor_item().label("valor"),
        )
        .select_from(ItemEntrada)
        .outerjoin(Produto, Produto.id == ItemEntrada.produto_id)
        .filter(ItemEntrada.entrada_id == entrada_id)
        .order_by(Produto.descricao, ItemEntrada.id)
        .all()
    )
    valores = [linha.valor for linha in itens if linha.valor is not None]
    return {
        **dict(nota._mapping),
        "valor": sum(valores) if valores else None,
        "itens": [dict(linha._mapping) for linha in itens],
    }
