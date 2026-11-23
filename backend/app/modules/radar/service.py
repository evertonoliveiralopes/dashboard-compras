from decimal import Decimal

from sqlalchemy import func

from app.models.historico_importacao import HistoricoImportacao
from app.models.produto_loja import ProdutoLoja
from app.modules.ia.analises import (
    DIAS_VENDAS,
    aumentos_fornecedores,
    demanda_recente,
    estoque_parado,
    intervalo_vendas,
    produtos_da_loja,
)


def montar_radar(db, loja, departamentos, percentual_minimo):
    inicio, fim, dias_registrados = intervalo_vendas(db, loja.id, DIAS_VENDAS)
    estoque_importado = (
        db.query(ProdutoLoja.id).filter(ProdutoLoja.loja_id == loja.id).first() is not None
    )
    importacao_produtos = db.query(func.max(HistoricoImportacao.criado_em)).filter(
        HistoricoImportacao.loja_id == loja.id,
        HistoricoImportacao.tipo == "Produtos",
        HistoricoImportacao.status == "SUCESSO",
    ).scalar()

    aumentos, ultima_entrada, tem_custos_comparaveis = aumentos_fornecedores(
        db, loja, departamentos
    )
    limite = Decimal(str(percentual_minimo))
    aumentos = [item for item in aumentos if item["variacao"] >= limite]
    aumentos.sort(key=lambda item: (item["data_atual"], item["variacao"]), reverse=True)

    ruptura = None
    reposicao = None
    parado = None
    valor_parado = None
    sem_historico = 0
    sem_custo = 0
    if estoque_importado and fim is not None:
        base = produtos_da_loja(db, loja.id, departamentos)
        demanda = demanda_recente(db, base, loja, inicio, fim, "comprar")
        demanda.sort(key=lambda item: (item["cobertura"], -item["media_diaria"], item["codigo"]))
        ruptura = [item for item in demanda if item["saldo"] <= 0]
        reposicao = [item for item in demanda if item["saldo"] > 0]

        parado, sem_historico = estoque_parado(db, base, loja, fim)
        parado.sort(key=lambda item: (item["valor"] is None, -(item["valor"] or 0), item["codigo"]))
        valores = [item["valor"] for item in parado if item["valor"] is not None]
        sem_custo = len(parado) - len(valores)
        if valores or not parado:
            valor_parado = sum(valores)

    return {
        "ruptura": ruptura,
        "reposicao": reposicao,
        "parado": parado,
        "aumentos": aumentos if tem_custos_comparaveis else None,
        "valor_parado": valor_parado,
        "sem_historico": sem_historico,
        "sem_custo": sem_custo,
        "estoque_importado": estoque_importado,
        "importacao_produtos": importacao_produtos,
        "vendas_inicio": inicio,
        "vendas_fim": fim,
        "dias_vendas_registrados": dias_registrados,
        "dias_vendas_referencia": DIAS_VENDAS,
        "ultima_entrada": ultima_entrada,
    }
