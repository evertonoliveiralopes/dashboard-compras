from app.modules.fornecedores.leitores.csv_reader import ler_csv
from app.modules.fornecedores.leitores.excel_reader import ler_excel
from app.modules.fornecedores.normalizadores.arius import normalizar


def ler_arquivo(arquivo):

    nome = arquivo.filename.lower()

    if nome.endswith(".csv"):
        df = ler_csv(arquivo)
        return normalizar(df)

    if nome.endswith(".xlsx"):
        df = ler_excel(arquivo)
        return normalizar(df)

    raise Exception("Formato não suportado.")