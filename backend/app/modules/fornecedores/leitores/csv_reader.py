import csv
import io

import pandas as pd


def ler_csv(arquivo):

    conteudo = arquivo.file.read().decode("utf-8")

    linhas = list(
        csv.reader(
            io.StringIO(conteudo),
            delimiter=";",
        )
    )

    if not linhas:
        return pd.DataFrame()

    cabecalho = linhas[0]
    quantidade_colunas = len(cabecalho)

    linhas_normalizadas = []

    for linha in linhas[1:]:

        # Ignora linhas vazias, rodapés e totais do relatório
        if len(linha) < quantidade_colunas:
            continue

        if len(linha) == quantidade_colunas:
            linhas_normalizadas.append(linha)
            continue

        # Algumas linhas do Arius possuem campos extras entre
        # Email e Situação. Mantemos as 14 primeiras colunas,
        # ignoramos os campos excedentes e usamos o último campo
        # como Situação.
        linha_normalizada = (
            linha[:14]
            + [""] * (quantidade_colunas - 15)
            + [linha[-1]]
        )

        linhas_normalizadas.append(linha_normalizada)

    return pd.DataFrame(
        linhas_normalizadas,
        columns=cabecalho,
    )