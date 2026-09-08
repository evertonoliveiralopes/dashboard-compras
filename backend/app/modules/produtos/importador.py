import pandas as pd
from sqlalchemy.orm import Session
from app.utils.codigo_produto import normalizar_codigo_produto
from app.utils.normalizar_codigo import normalizar_codigo

from app.models.produto import Produto

def limpar_status(valor):

    if pd.isna(valor):
        return 0

    valor = str(valor).strip()

    if valor == "":
        return 0

    try:
        return int(valor.split("-")[0].strip())
    except:
        return 0


def limpar_texto(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
        return None

    return valor


def limpar_codigo(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "":
        return None

    return valor


def limpar_decimal(valor):
    if pd.isna(valor):
        return 0

    if isinstance(valor, (int, float)):
        return float(valor)

    valor = (
        str(valor)
        .replace(".", "")
        .replace(",", ".")
        .strip()
    )

    try:
        return float(valor)
    except:
        return 0


def importar_dataframe(df: pd.DataFrame, db: Session):

    from sqlalchemy.dialects.postgresql import insert

    inseridos = 0
    atualizados = 0

    # Normaliza os códigos
    df = df.copy()

    df["_codigo_normalizado"] = df["Código"].apply(
        normalizar_codigo_produto
    )

    # Remove registros sem código
    df = df[
        df["_codigo_normalizado"].notna()
        & (df["_codigo_normalizado"] != "")
    ]

    # Remove códigos duplicados dentro do próprio arquivo,
    # mantendo somente a última ocorrência
    df = df.drop_duplicates(
        subset=["_codigo_normalizado"],
        keep="last"
    )

    tamanho_lote = 1000

    # Processa em lotes para reduzir memória e tempo de transação
    for inicio_lote in range(0, len(df), tamanho_lote):

        lote = df.iloc[
            inicio_lote:inicio_lote + tamanho_lote
        ]

        codigos_lote = lote["_codigo_normalizado"].tolist()

        # Identifica quais códigos já existem
        existentes = set(
            codigo
            for (codigo,) in (
                db.query(Produto.codigo)
                .filter(Produto.codigo.in_(codigos_lote))
                .all()
            )
        )

        registros = []

        for _, linha in lote.iterrows():

            codigo = linha["_codigo_normalizado"]

            registro = {
                "codigo": codigo,
                "descricao": limpar_texto(
                    linha.get("Descrição")
                ),
                "departamento": normalizar_codigo(
                    linha.get("Depto.")
                ),
                "custo": limpar_decimal(
                    linha.get("Custo")
                ),
                "preco_venda": limpar_decimal(
                    linha.get("Preço Venda")
                ),
                "estoque": limpar_decimal(
                    linha.get("Estoque Atual")
                ),
                "estoque_minimo": 0,
                "status": limpar_status(
                    linha.get("Status")
                ),
            }

            registros.append(registro)

            if codigo in existentes:
                atualizados += 1
            else:
                inseridos += 1

        # UPSERT PostgreSQL
        comando = insert(Produto).values(registros)

        comando = comando.on_conflict_do_update(
            index_elements=["codigo"],
            set_={
                "descricao": comando.excluded.descricao,
                "departamento": comando.excluded.departamento,
                "custo": comando.excluded.custo,
                "preco_venda": comando.excluded.preco_venda,
                "estoque": comando.excluded.estoque,
                "status": comando.excluded.status,
            },
        )

        db.execute(comando)

        # Libera o lote antes de continuar
        db.commit()

    return {
        "inseridos": inseridos,
        "atualizados": atualizados,
    }
