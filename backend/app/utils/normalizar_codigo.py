import pandas as pd


def normalizar_codigo(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "":
        return None

    try:
        numero = float(valor)

        if numero.is_integer():
            return str(int(numero))

    except Exception:
        pass

    return valor