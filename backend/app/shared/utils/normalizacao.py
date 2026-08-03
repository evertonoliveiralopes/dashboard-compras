import pandas as pd
import re


def limpar_texto(valor):

    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "":
        return None

    return valor


def limpar_cnpj(valor):

    valor = limpar_texto(valor)

    if valor is None:
        return None

    # Remove notação científica
    try:
        if "E+" in valor.upper():
            valor = str(int(float(valor.replace(",", "."))))
    except Exception:
        pass

    # Mantém apenas números
    valor = re.sub(r"\D", "", valor)

    if valor == "":
        return None

    return valor


def texto_para_boolean(valor):

    valor = limpar_texto(valor)

    if valor is None:
        return True

    valor = valor.upper()

    if valor in (
        "SIM",
        "S",
        "ATIVO",
        "TRUE",
        "1",
    ):
        return True

    if valor in (
        "NÃO",
        "NAO",
        "N",
        "INATIVO",
        "FALSE",
        "0",
    ):
        return False

    return True