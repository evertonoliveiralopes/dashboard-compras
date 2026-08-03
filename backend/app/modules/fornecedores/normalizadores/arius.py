import pandas as pd


def normalizar(df: pd.DataFrame):

    # Remove espaços das colunas
    df.columns = [str(col).strip() for col in df.columns]
    
    print("ANTES DO RENAME")
    print(df.columns.tolist())
    print(df.head())

    # Renomeia colunas do Arius
    df = df.rename(columns={
        "Código": "codigo",
        "Descrição": "razao_social",
        "Nome Fantasia": "nome_fantasia",
        "CNPJ/CPF": "cnpj",
        "Email": "email",
        "Situação": "ativo",
    })
    
    print("DEPOIS DO RENAME")
    print(df.head())

    # Mantém apenas as colunas utilizadas
    colunas = [
        "codigo",
        "razao_social",
        "nome_fantasia",
        "cnpj",
        "email",
        "ativo",
    ]

    for coluna in colunas:
        if coluna not in df.columns:
            df[coluna] = None

    df = df[colunas]

    return df