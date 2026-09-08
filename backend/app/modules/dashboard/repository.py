from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.produto import Produto
from app.models.produto_loja import ProdutoLoja
from app.models.fornecedor import Fornecedor
from app.models.item_entrada import ItemEntrada
from app.models.entrada import Entrada
from app.models.departamento import Departamento
from app.models.historico_importacao import HistoricoImportacao


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

    def compras_por_mes(self, db: Session, loja_id=None):
        query = (
            db.query(
                func.to_char(
                    Entrada.data_entrada,
                    "Mon"
                ).label("mes"),
                func.sum(
                    ItemEntrada.quantidade * ItemEntrada.custo
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

        resultado = (
            query
            .group_by(
                func.to_char(
                    Entrada.data_entrada,
                    "Mon"
                )
            )
            .order_by(
                func.min(Entrada.data_entrada)
            )
            .all()
        )

        meses = {
            "Jan": 0,
            "Fev": 0,
            "Mar": 0,
            "Abr": 0,
            "Mai": 0,
            "Jun": 0,
            "Jul": 0,
            "Ago": 0,
            "Set": 0,
            "Out": 0,
            "Nov": 0,
            "Dez": 0,
        }

        for linha in resultado:
            mes = linha.mes.capitalize()[:3]

            if mes in meses:
                meses[mes] = float(linha.valor or 0)

        return [
            {
                "mes": mes,
                "valor": valor,
            }
            for mes, valor in meses.items()
        ]

    def top_fornecedores(self, db: Session, loja_id=None):
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
                "fornecedor": linha.fornecedor or "Fornecedor não identificado",
                "valor": float(linha.valor or 0),
            }
            for linha in resultado
        ]

    def compras_por_departamento(self, db: Session, loja_id=None):
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
                "departamento": linha.departamento or "Sem departamento",
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