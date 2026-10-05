from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.produto import Produto
from app.models.produto_loja import ProdutoLoja
from app.models.fornecedor import Fornecedor
from app.models.item_entrada import ItemEntrada
from app.models.entrada import Entrada
from app.models.departamento import Departamento
from app.models.historico_importacao import HistoricoImportacao
from app.models.venda import Venda


class DashboardRepository:

    def total_produtos(self, db: Session):
        return db.query(Produto).count()

    def total_fornecedores(self, db: Session):
        return db.query(Fornecedor).count()

    def total_compras(self, db: Session, loja_id=None):
        query = (
            db.query(ItemEntrada)
            .join(
                Entrada,
                Entrada.id == ItemEntrada.entrada_id,
            )
        )

        if loja_id:
            query = query.filter(
                Entrada.loja_id == loja_id
            )

        return query.count()

    def compras_por_mes(
        self,
        db: Session,
        loja_id=None,
        data_inicio=None,
        data_fim=None,
    ):
        ano = func.extract(
            "year",
            Entrada.data_entrada,
        ).label("ano")

        mes = func.extract(
            "month",
            Entrada.data_entrada,
        ).label("mes")

        query = (
            db.query(
                ano,
                mes,
                func.sum(
                    ItemEntrada.quantidade
                    * ItemEntrada.custo
                ).label("valor"),
            )
            .join(
                ItemEntrada,
                Entrada.id == ItemEntrada.entrada_id,
            )
        )

        if loja_id:
            query = query.filter(
                Entrada.loja_id == loja_id
            )

        if data_inicio:
            query = query.filter(
                Entrada.data_entrada >= data_inicio
            )

        if data_fim:
            query = query.filter(
                Entrada.data_entrada < data_fim
            )

        resultado = (
            query
            .group_by(
                ano,
                mes,
            )
            .order_by(
                ano,
                mes,
            )
            .all()
        )

        return [
            {
                "ano": int(linha.ano),
                "mes": int(linha.mes),
                "valor": float(linha.valor or 0),
            }
            for linha in resultado
        ]

    def top_fornecedores(
        self,
        db: Session,
        loja_id=None,
        data_inicio=None,
        data_fim=None,
    ):
        query = (
            db.query(
                Fornecedor.nome_fantasia.label("fornecedor"),
                func.sum(
                    ItemEntrada.quantidade * ItemEntrada.custo
                ).label("valor"),
            )
            .join(
                Entrada,
                Fornecedor.id == Entrada.fornecedor_id,
            )
            .join(
                ItemEntrada,
                Entrada.id == ItemEntrada.entrada_id,
            )
        )

        if loja_id:
            query = query.filter(
                Entrada.loja_id == loja_id
            )

        if data_inicio:
            query = query.filter(
                Entrada.data_entrada >= data_inicio
            )

        if data_fim:
            query = query.filter(
                Entrada.data_entrada < data_fim
            )

        resultado = (
            query
            .group_by(
                Fornecedor.nome_fantasia
            )
            .order_by(
                func.sum(
                    ItemEntrada.quantidade * ItemEntrada.custo
                ).desc()
            )
            .limit(5)
            .all()
        )

        return [
            {
                "fornecedor": linha.fornecedor
                or "Fornecedor não identificado",
                "valor": float(linha.valor or 0),
            }
            for linha in resultado
        ]

    def compras_por_departamento(
        self,
        db: Session,
        loja_id=None,
        data_inicio=None,
        data_fim=None,
    ):
        query = (
            db.query(
                Departamento.descricao.label("departamento"),
                func.sum(
                    ItemEntrada.quantidade * ItemEntrada.custo
                ).label("valor"),
            )
            .join(
                Produto,
                Produto.departamento == Departamento.codigo,
            )
            .join(
                ItemEntrada,
                ItemEntrada.produto_id == Produto.id,
            )
            .join(
                Entrada,
                Entrada.id == ItemEntrada.entrada_id,
            )
        )

        if loja_id:
            query = query.filter(
                Entrada.loja_id == loja_id
            )

        if data_inicio:
            query = query.filter(
                Entrada.data_entrada >= data_inicio
            )

        if data_fim:
            query = query.filter(
                Entrada.data_entrada < data_fim
            )

        resultado = (
            query
            .group_by(
                Departamento.descricao
            )
            .order_by(
                func.sum(
                    ItemEntrada.quantidade * ItemEntrada.custo
                ).desc()
            )
            .all()
        )

        return [
            {
                "departamento": linha.departamento
                or "Sem departamento",
                "valor": float(linha.valor or 0),
            }
            for linha in resultado
        ]

    def alertas(self, db: Session, loja_id=None):

        alertas = []

        produtos_sem_estoque_query = (
            db.query(Produto)
            .join(
                ProdutoLoja,
                Produto.id == ProdutoLoja.produto_id,
            )
            .filter(
                ProdutoLoja.estoque_atual <= 0
            )
        )

        if loja_id:
            produtos_sem_estoque_query = produtos_sem_estoque_query.filter(
                ProdutoLoja.loja_id == loja_id
            )

        produtos_sem_estoque = (
            produtos_sem_estoque_query
            .limit(10)
            .all()
        )

        for produto in produtos_sem_estoque:
            alertas.append(
                {
                    "tipo": "SEM_ESTOQUE",
                    "produto": produto.descricao,
                    "detalhe": "Estoque atual: 0",
                }
            )

        produtos_sem_custo_query = (
            db.query(Produto)
            .join(
                ProdutoLoja,
                Produto.id == ProdutoLoja.produto_id,
            )
            .filter(
                ProdutoLoja.custo <= 0
            )
        )

        if loja_id:
            produtos_sem_custo_query = produtos_sem_custo_query.filter(
                ProdutoLoja.loja_id == loja_id
            )

        produtos_sem_custo = (
            produtos_sem_custo_query
            .limit(10)
            .all()
        )

        for produto in produtos_sem_custo:
            alertas.append(
                {
                    "tipo": "SEM_CUSTO",
                    "produto": produto.descricao,
                    "detalhe": "Produto sem custo cadastrado",
                }
            )

        produtos_sem_movimento_query = (
            db.query(Produto)
            .join(
                ProdutoLoja,
                Produto.id == ProdutoLoja.produto_id,
            )
            .outerjoin(
                ItemEntrada,
                Produto.id == ItemEntrada.produto_id,
            )
            .outerjoin(
                Entrada,
                (ItemEntrada.entrada_id == Entrada.id)
                & (
                    (Entrada.loja_id == loja_id)
                    if loja_id
                    else True
                ),
            )
            .filter(
                Entrada.id == None
            )
        )

        if loja_id:
            produtos_sem_movimento_query = produtos_sem_movimento_query.filter(
                ProdutoLoja.loja_id == loja_id
            )

        produtos_sem_movimento = (
            produtos_sem_movimento_query
            .limit(10)
            .all()
        )

        for produto in produtos_sem_movimento:
            alertas.append(
                {
                    "tipo": "SEM_COMPRA",
                    "produto": produto.descricao,
                    "detalhe": "Nunca houve entrada registrada",
                }
            )

        return alertas

    def ultimas_importacoes(self, db: Session, loja_id=None):
        query = (
            db.query(HistoricoImportacao)
        )

        if loja_id:
            query = query.filter(
                HistoricoImportacao.loja_id == loja_id
            )

        resultado = (
            query
            .order_by(
                HistoricoImportacao.criado_em.desc()
            )
            .limit(5)
            .all()
        )

        return [
            {
                "tipo": item.tipo,
                "arquivo": item.arquivo,
                "registros": item.registros,
                "inseridos": item.inseridos,
                "atualizados": item.atualizados,
                "erros": item.erros,
                "status": item.status,
                "criado_em": item.criado_em,
            }
            for item in resultado
        ]
    def total_valor_estoque(self, db: Session, loja_id=None):
        query = (
            db.query(
                func.coalesce(
                    func.sum(
                        ProdutoLoja.estoque_atual
                        * ProdutoLoja.custo
                    ),
                    0,
                )
            )
        )

        if loja_id:
            query = query.filter(
                ProdutoLoja.loja_id == loja_id
            )

        resultado = query.scalar()

        return float(resultado)

    def indicadores_periodo(
        self,
        db: Session,
        loja_id,
        data_inicio,
        data_fim,
        data_inicio_anterior,
        data_fim_anterior,
    ):
        compras_atual = (
            db.query(
                func.coalesce(
                    func.sum(
                        ItemEntrada.quantidade
                        * ItemEntrada.custo
                    ),
                    0,
                )
            )
            .join(
                Entrada,
                Entrada.id == ItemEntrada.entrada_id,
            )
            .filter(
                Entrada.loja_id == loja_id,
                Entrada.data_entrada >= data_inicio,
                Entrada.data_entrada < data_fim,
            )
            .scalar()
        )

        compras_anterior = (
            db.query(
                func.coalesce(
                    func.sum(
                        ItemEntrada.quantidade
                        * ItemEntrada.custo
                    ),
                    0,
                )
            )
            .join(
                Entrada,
                Entrada.id == ItemEntrada.entrada_id,
            )
            .filter(
                Entrada.loja_id == loja_id,
                Entrada.data_entrada >= data_inicio_anterior,
                Entrada.data_entrada < data_fim_anterior,
            )
            .scalar()
        )

        vendas_atual = (
            db.query(
                func.coalesce(
                    func.sum(Venda.quantidade),
                    0,
                )
            )
            .filter(
                Venda.loja_id == loja_id,
                Venda.data >= data_inicio,
                Venda.data < data_fim,
            )
            .scalar()
        )

        vendas_anterior = (
            db.query(
                func.coalesce(
                    func.sum(Venda.quantidade),
                    0,
                )
            )
            .filter(
                Venda.loja_id == loja_id,
                Venda.data >= data_inicio_anterior,
                Venda.data < data_fim_anterior,
            )
            .scalar()
        )

        valor_estoque = (
            db.query(
                func.coalesce(
                    func.sum(
                        ProdutoLoja.estoque_atual
                        * ProdutoLoja.custo
                    ),
                    0,
                )
            )
            .filter(
                ProdutoLoja.loja_id == loja_id
            )
            .scalar()
        )

        return {
            "compras_atual": float(compras_atual or 0),
            "compras_anterior": float(compras_anterior or 0),
            "vendas_atual": float(vendas_atual or 0),
            "vendas_anterior": float(vendas_anterior or 0),
            "valor_estoque": float(valor_estoque or 0),
        }