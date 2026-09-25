import pandas as pd

from app.utils.codigo_produto import normalizar_codigo_produto
from app.models.venda import Venda


COLUNAS_OBRIGATORIAS = [
    "DATA_HORA",
    "PRODUTO",
    "DESCRITIVO",
    "QTDE",
    "LIQUIDO",
]

TAMANHO_LOTE = 5000


def limpar_texto(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
        return None

    return valor


def limpar_decimal(valor):
    if pd.isna(valor):
        return None

    if isinstance(valor, (int, float)):
        return float(valor)

    valor = str(valor).strip()

    if valor == "":
        return None

    valor = (
        valor
        .replace(".", "")
        .replace(",", ".")
    )

    try:
        return float(valor)
    except (ValueError, TypeError):
        return None


def limpar_data(valor):
    if pd.isna(valor):
        return None

    try:
        return pd.to_datetime(
            valor,
            dayfirst=True,
            errors="coerce",
        ).date()
    except Exception:
        return None


def importar_dataframe(
    df: pd.DataFrame,
    db,
    loja_id: int,
    nome_arquivo: str,
):
    colunas_ausentes = [
        coluna
        for coluna in COLUNAS_OBRIGATORIAS
        if coluna not in df.columns
    ]

    if colunas_ausentes:
        raise ValueError(
            "Colunas obrigatórias ausentes: "
            + ", ".join(colunas_ausentes)
        )

    inseridos = 0
    erros = 0

    for inicio in range(0, len(df), TAMANHO_LOTE):
        lote = df.iloc[
            inicio:inicio + TAMANHO_LOTE
        ]

        vendas = []

        for _, linha in lote.iterrows():
            data = limpar_data(linha["DATA_HORA"])
            codigo_produto = normalizar_codigo_produto(
                linha["PRODUTO"]
            )
            quantidade = limpar_decimal(linha["QTDE"])
            valor_total = limpar_decimal(linha["LIQUIDO"])

            if (
                data is None
                or codigo_produto is None
                or quantidade is None
                or valor_total is None
            ):
                erros += 1
                continue

            valor_unitario = None

            if quantidade != 0:
                valor_unitario = (
                    valor_total / quantidade
                )

            vendas.append(
                Venda(
                    empresa=f"LOJA {loja_id}",
                    loja_id=loja_id,
                    data=data,
                    codigo_produto=codigo_produto,
                    descricao=limpar_texto(
                        linha["DESCRITIVO"]
                    ),
                    unidade=None,
                    qtde_embalagem=None,
                    quantidade=quantidade,
                    valor_unitario=valor_unitario,
                    valor_total=valor_total,
                    custo_unitario=None,
                    custo_total=None,
                    margem=None,
                )
            )

        if vendas:
            db.add_all(vendas)
            db.commit()
            inseridos += len(vendas)

        print(
            f"Importação de vendas: "
            f"{min(inicio + TAMANHO_LOTE, len(df))}/"
            f"{len(df)} registros processados"
        )

    return {
        "status": "ok",
        "registros_importados": inseridos,
        "inseridos": inseridos,
        "atualizados": 0,
        "erros": erros,
    }
