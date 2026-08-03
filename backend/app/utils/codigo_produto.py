def normalizar_codigo_produto(valor):

    if valor is None:
        return None

    valor = str(valor).strip()

    if valor == "":
        return None

    # Remove .0 vindo de exportação Excel/Pandas
    if valor.endswith(".0"):
        valor = valor[:-2]

    # Remove hífen do código Arius
    valor = valor.replace("-", "")

    # Remove zeros à esquerda
    valor = valor.lstrip("0")

    return valor