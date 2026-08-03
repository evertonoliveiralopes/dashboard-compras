import pandas as pd


def normalizar_codigo_fornecedor(valor):

    if valor is None:
        return None

    if pd.isna(valor):
        return None

    valor = str(valor).strip().upper()

    if valor == "":
        return None

    # Remove a letra F do padrão Arius
    if valor.startswith("F"):
        valor = valor[1:]

    # Remove .0 vindo do Excel/Pandas
    if valor.endswith(".0"):
        valor = valor[:-2]

    # Remove zeros à esquerda
    valor = valor.lstrip("0")

    return valor