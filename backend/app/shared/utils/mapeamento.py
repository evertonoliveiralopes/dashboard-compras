MAPEAMENTO_PRODUTOS = {
    "codigo": [
        "Código",
        "Codigo",
        "Cod.",
        "Cod Produto",
        "Código Produto"
    ],

    "descricao": [
        "Descrição",
        "Descricao",
        "Descrição Produto"
    ],

    "ean": [
        "EAN",
        "EAN Principal",
        "Código Barras"
    ],

    "estoque": [
        "Estoque Atual",
        "Saldo",
        "Estoque"
    ],

    "preco_venda": [
        "Preço Venda",
        "Preco Venda",
        "Preço"
    ],

    "custo": [
        "Custo",
        "Custo Médio",
        "Custo Medio"
    ],

    "departamento": [
        "Depto.",
        "Departamento",
        "Descrição Árvore Departamentos"
    ],

    "cobertura": [
        "Cobertura",
        "Cobertura (Venda Média)"
    ],

    "ultima_entrada": [
        "Data Última Entrada"
    ],

    "ultima_venda": [
        "Data Última Venda"
    ]
}

def identificar_colunas(colunas, mapa):
    resultado = {}

    for campo, apelidos in mapa.items():

        for coluna in colunas:

            if coluna.strip() in apelidos:
                resultado[campo] = coluna
                break

    return resultado