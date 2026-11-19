from datetime import timedelta
from decimal import Decimal

from sqlalchemy import func

from app.models.entrada import Entrada
from app.models.fornecedor import Fornecedor
from app.models.item_entrada import ItemEntrada
from app.models.produto import Produto
from app.models.produto_loja import ProdutoLoja
from app.models.venda import Venda

DIAS_VENDAS = 30
DIAS_COBERTURA = 7
DIAS_PARADO = 90

TITULOS = {
    "comprar": "Produtos para revisar antes de comprar",
    "fornecedor": "Fornecedores com aumento no custo de compra",
    "ruptura": "Ruptura por loja",
    "parado": "Valor do estoque parado há mais de 90 dias",
}

CRITERIOS = {
    "comprar": "Produtos ativos com vendas recentes e cobertura de até 7 dias. "
    "A média diária usa o intervalo disponível de até 30 dias corridos.",
    "fornecedor": "Duas últimas entradas com custo positivo do mesmo produto, "
    "fornecedor e loja. As datas indicam quando cada custo foi registrado.",
    "ruptura": "Produtos ativos com saldo zero ou negativo e alguma venda "
    "positiva registrada no intervalo disponível de até 30 dias.",
    "parado": "Saldo atual × custo cadastrado na loja para produtos ativos "
    "com saldo positivo e última venda registrada há mais de 90 dias, "
    "medidos até a última data de vendas importada da loja.",
}


def produtos_da_loja(db, loja_id, departamentos):
    consulta = (
        db.query(Produto)
        .join(ProdutoLoja, ProdutoLoja.produto_id == Produto.id)
        .filter(ProdutoLoja.loja_id == loja_id, Produto.status == 0)
    )
    if departamentos:
        consulta = consulta.filter(Produto.departamento.in_(departamentos))
    return consulta


def intervalo_vendas(db, loja_id, dias):
    vendas = db.query(Venda.data).filter(Venda.loja_id == loja_id)
    primeira, ultima = vendas.with_entities(func.min(Venda.data), func.max(Venda.data)).one()
    if ultima is None:
        return None, None, 0

    inicio = max(primeira, ultima - timedelta(days=dias - 1))
    registrados = vendas.filter(Venda.data >= inicio).with_entities(
        func.count(func.distinct(Venda.data))
    ).scalar()
    return inicio, ultima, registrados


def demanda_recente(db, base, loja, inicio, fim, tipo):
    dias = (fim - inicio).days + 1
    vendas = (
        db.query(
            Venda.codigo_produto.label("codigo"),
            func.sum(Venda.quantidade).label("quantidade"),
        )
        .filter(
            Venda.loja_id == loja.id,
            Venda.data.between(inicio, fim),
            Venda.quantidade > 0,
        )
        .group_by(Venda.codigo_produto)
        .subquery()
    )
    media = vendas.c.quantidade / dias
    candidatos = base.join(vendas, vendas.c.codigo == Produto.codigo)

    if tipo == "ruptura":
        quantidade = candidatos.filter(ProdutoLoja.estoque_atual <= 0).count()
        return [{"loja": loja.nome, "quantidade": quantidade}]

    produtos = candidatos.filter(ProdutoLoja.estoque_atual <= media * DIAS_COBERTURA)
    linhas = produtos.with_entities(
        Produto.codigo, Produto.descricao, ProdutoLoja.estoque_atual, media
    ).all()
    return [
        {
            "loja": loja.nome,
            "codigo": codigo,
            "produto": descricao,
            "saldo": saldo,
            "media_diaria": media_diaria,
            "cobertura": max(saldo, Decimal("0")) / media_diaria,
        }
        for codigo, descricao, saldo, media_diaria in linhas
    ]


def estoque_parado(db, base, loja, ultima_data):
    ultima_venda = (
        db.query(
            Venda.codigo_produto.label("codigo"),
            func.max(Venda.data).label("ultima"),
        )
        .filter(Venda.loja_id == loja.id, Venda.quantidade > 0)
        .group_by(Venda.codigo_produto)
        .subquery()
    )
    com_saldo = base.filter(ProdutoLoja.estoque_atual > 0).outerjoin(
        ultima_venda, ultima_venda.c.codigo == Produto.codigo
    )
    sem_historico = com_saldo.filter(ultima_venda.c.ultima.is_(None)).count()
    limite = ultima_data - timedelta(days=DIAS_PARADO)
    linhas = com_saldo.filter(ultima_venda.c.ultima < limite).with_entities(
        Produto.codigo,
        Produto.descricao,
        ProdutoLoja.estoque_atual,
        ProdutoLoja.custo,
        ultima_venda.c.ultima,
    ).all()
    return [
        {
            "loja": loja.nome,
            "codigo": codigo,
            "produto": descricao,
            "saldo": saldo,
            "ultima_venda": data,
            "valor": saldo * custo if custo > 0 else None,
        }
        for codigo, descricao, saldo, custo, data in linhas
    ], sem_historico


def aumentos_fornecedores(db, loja, departamentos):
    grupo = (Entrada.fornecedor_id, ItemEntrada.produto_id)
    ordem = (Entrada.data_entrada.desc(), Entrada.id.desc(), ItemEntrada.id.desc())
    janela = {"partition_by": grupo, "order_by": ordem}
    historico = (
        db.query(
            Entrada.fornecedor_id.label("fornecedor_id"),
            Produto.codigo.label("codigo"),
            Produto.descricao.label("produto"),
            Entrada.data_entrada.label("data_atual"),
            ItemEntrada.custo.label("custo_atual"),
            func.lead(Entrada.data_entrada).over(**janela).label("data_anterior"),
            func.lead(ItemEntrada.custo).over(**janela).label("custo_anterior"),
            func.row_number().over(**janela).label("ordem"),
        )
        .join(Entrada, Entrada.id == ItemEntrada.entrada_id)
        .join(Produto, Produto.id == ItemEntrada.produto_id)
        .filter(
            Entrada.loja_id == loja.id,
            Entrada.fornecedor_id.is_not(None),
            Entrada.data_entrada.is_not(None),
            ItemEntrada.custo > 0,
        )
    )
    if departamentos:
        historico = historico.filter(Produto.departamento.in_(departamentos))
    compras = historico.subquery()
    comparacoes = db.query(compras).filter(
        compras.c.ordem == 1, compras.c.custo_anterior.is_not(None)
    )
    ultima_data = db.query(func.max(compras.c.data_atual)).scalar()
    if ultima_data is None:
        return [], None, False

    aumentos = (
        comparacoes.add_columns(func.coalesce(
            func.nullif(Fornecedor.nome_fantasia, ""), Fornecedor.razao_social
        ).label("fornecedor"))
        .join(Fornecedor, Fornecedor.id == compras.c.fornecedor_id)
        .filter(compras.c.custo_atual > compras.c.custo_anterior)
        .all()
    )
    itens = [
        {
            "loja": loja.nome,
            "fornecedor": linha.fornecedor,
            "codigo": linha.codigo,
            "produto": linha.produto,
            "custo_anterior": linha.custo_anterior,
            "custo_atual": linha.custo_atual,
            "data_anterior": linha.data_anterior,
            "data_atual": linha.data_atual,
            "variacao": 100 * (linha.custo_atual - linha.custo_anterior) / linha.custo_anterior,
        }
        for linha in aumentos
    ]
    return itens, ultima_data, bool(itens) or comparacoes.first() is not None


def analisar(db, tipo, lojas, departamentos):
    itens = []
    fontes = []
    avisos = []
    lojas_consultadas = 0
    for loja in lojas:
        if tipo == "fornecedor":
            aumentos, ultima_data, comparavel = aumentos_fornecedores(db, loja, departamentos)
            fontes.append({"loja": loja.nome, "fim": ultima_data})
            if not comparavel:
                avisos.append(f"{loja.nome}: nenhuma dupla de compras com custo para comparar.")
            else:
                lojas_consultadas += 1
            itens.extend(aumentos)
            continue

        dias = DIAS_PARADO + 1 if tipo == "parado" else DIAS_VENDAS
        inicio, fim, registrados = intervalo_vendas(db, loja.id, dias)
        fontes.append({"loja": loja.nome, "inicio": inicio, "fim": fim})
        if fim is None:
            avisos.append(f"{loja.nome}: sem histórico de vendas importado.")
            continue
        if registrados < dias:
            avisos.append(
                f"{loja.nome}: há registros em {registrados} dos {dias} dias de referência. "
                "O resultado considera as vendas disponíveis."
            )
        if not db.query(ProdutoLoja.id).filter(ProdutoLoja.loja_id == loja.id).first():
            avisos.append(f"{loja.nome}: sem saldos de estoque importados.")
            continue

        base = produtos_da_loja(db, loja.id, departamentos)
        lojas_consultadas += 1
        if tipo == "parado":
            produtos, sem_historico = estoque_parado(db, base, loja, fim)
            itens.extend(produtos)
            if sem_historico:
                avisos.append(
                    f"{loja.nome}: {sem_historico} produtos com saldo sem nenhuma venda "
                    "registrada. A idade desse estoque não pôde ser determinada."
                )
        else:
            itens.extend(demanda_recente(db, base, loja, inicio, fim, tipo))

    if tipo == "comprar":
        itens.sort(key=lambda item: (item["cobertura"], -item["media_diaria"], item["codigo"]))
    elif tipo == "ruptura":
        itens.sort(key=lambda item: (-item["quantidade"], item["loja"]))
    elif tipo == "fornecedor":
        itens.sort(key=lambda item: (item["data_atual"], item["variacao"]), reverse=True)

    resposta = {
        "tipo": tipo,
        "titulo": TITULOS[tipo],
        "criterio": CRITERIOS[tipo],
        "itens": itens,
        "fontes": fontes,
        "avisos": avisos,
        "lojas_consultadas": lojas_consultadas,
    }
    if tipo == "parado":
        itens.sort(key=lambda item: item["valor"] or 0, reverse=True)
        valores = [item["valor"] for item in itens if item["valor"] is not None]
        if valores:
            resposta["valor_total"] = sum(valores)
        elif lojas_consultadas and not itens:
            resposta["valor_total"] = 0
        sem_custo = len(itens) - len(valores)
        if sem_custo:
            avisos.append(f"{sem_custo} itens sem custo positivo ficaram fora do valor total.")

    return resposta
