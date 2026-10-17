import pandas as pd

from app.modules.vendas.importador import consolidar_vendas


def test_consolidacao_diaria_preserva_totais():
    vendas = pd.DataFrame([
        {"loja_id": 1, "data": "2026-10-01", "codigo_produto": "100", "quantidade": 2, "valor_total": 20},
        {"loja_id": 1, "data": "2026-10-01", "codigo_produto": "100", "quantidade": 3, "valor_total": 30},
        {"loja_id": 1, "data": "2026-10-01", "codigo_produto": "100", "quantidade": -1, "valor_total": -10},
        {"loja_id": 1, "data": "2026-10-02", "codigo_produto": "100", "quantidade": 4, "valor_total": 40},
    ])

    resultado = consolidar_vendas(vendas)

    assert len(resultado) == 2
    assert resultado["quantidade"].sum() == 8
    assert resultado["valor_total"].sum() == 80

    primeiro_dia = resultado[
        resultado["data"] == "2026-10-01"
    ].iloc[0]

    assert primeiro_dia["quantidade"] == 4
    assert primeiro_dia["valor_total"] == 40


def test_consolidacao_separa_lojas_e_produtos():
    vendas = pd.DataFrame([
        {"loja_id": 1, "data": "2026-10-01", "codigo_produto": "100", "quantidade": 2, "valor_total": 20},
        {"loja_id": 1, "data": "2026-10-01", "codigo_produto": "100", "quantidade": 3, "valor_total": 30},
        {"loja_id": 2, "data": "2026-10-01", "codigo_produto": "100", "quantidade": 4, "valor_total": 40},
        {"loja_id": 1, "data": "2026-10-01", "codigo_produto": "200", "quantidade": 5, "valor_total": 50},
    ])

    resultado = consolidar_vendas(vendas)

    assert len(resultado) == 3

    loja1_produto100 = resultado[
        (resultado["loja_id"] == 1)
        & (resultado["codigo_produto"] == "100")
    ].iloc[0]

    assert loja1_produto100["quantidade"] == 5
    assert loja1_produto100["valor_total"] == 50

    assert resultado["quantidade"].sum() == 14
    assert resultado["valor_total"].sum() == 140
