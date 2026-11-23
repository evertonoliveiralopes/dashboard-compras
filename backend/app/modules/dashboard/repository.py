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
from app.modules.config_alertas.service import ConfigAlertaService
from datetime import date, timedelta


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

    def alertas(self, db: Session, loja_id=None, usuario_id=None, codigos_composicao=None):
        
        config_service = ConfigAlertaService()

        tipos_configurados = config_service.listar_tipos(
            db,
            usuario_id,
        )

        departamentos_configurados = config_service.listar(
            db,
            usuario_id,
        )
        
        departamentos_ativos_ids = [
            configuracao.departamento_id
            for configuracao in departamentos_configurados
            if configuracao.ativo
        ]
        
        departamentos_ativos_codigos = []

        if departamentos_ativos_ids:
            departamentos_ativos_codigos = [
                codigo
                for (codigo,) in (
                    db.query(Departamento.codigo)
                    .filter(Departamento.id.in_(departamentos_ativos_ids))
                    .all()
                )
            ]
        
        alertas = []

        produtos_em_alerta = (
            db.query(Produto)
            .join(
                ProdutoLoja,
                Produto.id == ProdutoLoja.produto_id,
            )
            .filter(Produto.status == 0)
        )
        if loja_id is not None:
            produtos_em_alerta = produtos_em_alerta.filter(ProdutoLoja.loja_id == loja_id)
        if departamentos_configurados:
            produtos_em_alerta = produtos_em_alerta.filter(Produto.departamento.in_(departamentos_ativos_codigos))
        if codigos_composicao:
            produtos_em_alerta = produtos_em_alerta.filter(Produto.codigo.not_in(codigos_composicao))

        produtos_sem_estoque = (
            produtos_em_alerta
            .filter(
                ProdutoLoja.estoque_atual
                < tipos_configurados["quantidade_minima_estoque"],
            )
            .limit(10)
            .all()
        )
        
        if tipos_configurados["estoque_minimo"]:
            for produto in produtos_sem_estoque:
                alertas.append(
                    {
                        "tipo": "SEM_ESTOQUE",
                        "codigo_produto": produto.codigo,
                        "produto": produto.descricao,
                        "detalhe": (
                            "Estoque abaixo do mínimo configurado: "
                            f"{tipos_configurados['quantidade_minima_estoque']:g}"
                        ),
                    }
                )

        produtos_sem_custo = (
            produtos_em_alerta
            .filter(ProdutoLoja.custo <= 0)
            .limit(10)
            .all()
        )

        for produto in produtos_sem_custo:
            alertas.append(
                {
                    "tipo": "SEM_CUSTO",
                    "codigo_produto": produto.codigo,
                    "produto": produto.descricao,
                    "detalhe": "Produto sem custo cadastrado",
                }
            )

        # Produtos sem entradas de compra na respectiva loja
        produtos_sem_movimento = (
            produtos_em_alerta
            .filter(
                ~db.query(ItemEntrada.id)
                .join(
                    Entrada,
                    Entrada.id == ItemEntrada.entrada_id,
                )
                .filter(
                    ItemEntrada.produto_id == Produto.id,
                    Entrada.loja_id == ProdutoLoja.loja_id,
                )
                .exists()
            )
            .limit(10)
            .all()
        )

        for produto in produtos_sem_movimento:
            alertas.append(
                {
                    "tipo": "SEM_COMPRA",
                    "codigo_produto": produto.codigo,
                    "produto": produto.descricao,
                    "detalhe": "Nunca houve entrada registrada",
                }
            )

        # Periodo configurado para identificar produtos sem vendas
        dias_sem_venda = tipos_configurados["dias_sem_venda"]

                # Identifica a última data de vendas disponível.
        ultima_venda_query = db.query(func.max(Venda.data))

        if loja_id is not None:
            ultima_venda_query = ultima_venda_query.filter(
                Venda.loja_id == loja_id
            )

        ultima_data_venda = ultima_venda_query.scalar()

        historico_completo = False

        if ultima_data_venda is not None:
            # Considera os N dias corridos até a última data importada.
            data_fim_sem_venda = ultima_data_venda + timedelta(days=1)
            data_inicio_sem_venda = data_fim_sem_venda - timedelta(
                days=dias_sem_venda
            )

            # Confirma que há histórico desde o início do período.
            primeira_venda_query = db.query(func.min(Venda.data))

            if loja_id is not None:
                primeira_venda_query = primeira_venda_query.filter(
                    Venda.loja_id == loja_id
                )

            primeira_data_venda = primeira_venda_query.scalar()

            historico_completo = (
                primeira_data_venda is not None
                and primeira_data_venda <= data_inicio_sem_venda
            )
        
        if tipos_configurados["sem_movimentacao"] and historico_completo:
            produtos_sem_venda = (
                produtos_em_alerta
                .filter(
                    ~db.query(Venda.id)
                    .filter(
                        Venda.codigo_produto == Produto.codigo,
                        Venda.loja_id == ProdutoLoja.loja_id,
                        Venda.data >= data_inicio_sem_venda,
                        Venda.data < data_fim_sem_venda,
                        Venda.quantidade > 0,
                    )
                    .exists()
                )
                .distinct()
                .limit(10)
                .all()
            )

            for produto in produtos_sem_venda:
                alertas.append(
                    {
                        "tipo": "SEM_VENDA",
                        "codigo_produto": produto.codigo,
                        "produto": produto.descricao,
                        "detalhe": (
                            "Produto sem vendas nos últimos "
                            f"{dias_sem_venda} dias"
                        ),
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


    def vendas_intervalo(
        self,
        db: Session,
        loja_id,
        data_inicio,
        data_fim,
    ):
        return (
            db.query(
                func.coalesce(func.sum(Venda.quantidade), 0),
                func.count(func.distinct(Venda.data)),
            )
            .filter(
                Venda.loja_id == loja_id,
                Venda.data >= data_inicio,
                Venda.data < data_fim,
            )
            .one()
        )

    def indicadores_periodo(
        self,
        db: Session,
        loja_id,
        data_inicio,
        data_fim,
        data_inicio_anterior,
        data_fim_anterior,
    ):
        compras_atual, itens_comprados = (
            db.query(
                func.coalesce(
                    func.sum(
                        ItemEntrada.quantidade
                        * ItemEntrada.custo
                    ),
                    0,
                ),
                func.count(ItemEntrada.id),
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
            .one()
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

        vendas_atual, dias_vendas = (
            db.query(
                func.coalesce(
                    func.sum(Venda.quantidade),
                    0,
                ),
                func.count(func.distinct(Venda.data)),
            )
            .filter(
                Venda.loja_id == loja_id,
                Venda.data >= data_inicio,
                Venda.data < data_fim,
            )
            .one()
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

        valor_estoque, produtos_estoque = (
            db.query(
                func.coalesce(
                    func.sum(
                        ProdutoLoja.estoque_atual
                        * ProdutoLoja.custo
                    ),
                    0,
                ),
                func.count(ProdutoLoja.id),
            )
            .filter(
                ProdutoLoja.loja_id == loja_id
            )
            .one()
        )

        return {
            "compras_atual": float(compras_atual or 0),
            "itens_comprados": itens_comprados,
            "compras_anterior": float(compras_anterior or 0),
            "vendas_atual": float(vendas_atual or 0),
            "dias_vendas": dias_vendas,
            "vendas_anterior": float(vendas_anterior or 0),
            "valor_estoque": float(valor_estoque or 0),
            "produtos_estoque": produtos_estoque,
        }
