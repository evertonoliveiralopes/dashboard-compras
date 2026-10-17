import pandas as pd
from decimal import Decimal, InvalidOperation

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

    if isinstance(valor, Decimal):
        return valor

    if isinstance(valor, (int, float)):
        return Decimal(str(valor))

    texto = str(valor).strip()

    if not texto:
        return None

    texto = texto.replace(".", "").replace(",", ".")

    try:
        return Decimal(texto)
    except InvalidOperation:
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
    """Prepara e substitui vendas por loja e dia, sem confirmar a transacao."""
    from hashlib import sha256

    # Toda a validacao acontece antes de excluir vendas existentes.
    consolidado = preparar_vendas_consolidadas(df, loja_id)

    datas = consolidado["data"].drop_duplicates().tolist()

    vendas = []

    for linha in consolidado.itertuples(index=False):
        quantidade = linha.quantidade
        valor_total = linha.valor_total

        valor_unitario = None
        if quantidade != 0:
            valor_unitario = (
                valor_total / quantidade
            ).quantize(Decimal("0.0001"))

        chave = sha256(
            f"{loja_id}|{linha.data.isoformat()}|"
            f"{linha.codigo_produto}".encode("utf-8")
        ).hexdigest()

        vendas.append(
            Venda(
                empresa=f"LOJA {loja_id}",
                loja_id=loja_id,
                data=linha.data,
                codigo_produto=linha.codigo_produto,
                descricao=linha.descricao,
                quantidade=quantidade,
                valor_unitario=valor_unitario,
                valor_total=valor_total,
                valor_liquido=valor_total,
                chave_origem=chave,
            )
        )

    # Substitui exclusivamente os dias presentes no arquivo.
    db.query(Venda).filter(
        Venda.loja_id == loja_id,
        Venda.data.in_(datas),
    ).delete(synchronize_session=False)

    # Flush envia os dados ao PostgreSQL, mas nao confirma a transacao.
    for inicio in range(0, len(vendas), TAMANHO_LOTE):
        db.add_all(vendas[inicio:inicio + TAMANHO_LOTE])
        db.flush()

    return {
        "status": "ok",
        "registros_importados": len(df),
        "inseridos": len(vendas),
        "atualizados": 0,
        "erros": 0,
        "dias_substituidos": len(datas),
    }


def consolidar_vendas(df: pd.DataFrame) -> pd.DataFrame:
    """Consolida vendas por loja, data e produto."""
    return (
        df.groupby(
            ["loja_id", "data", "codigo_produto"],
            as_index=False,
            sort=False,
            dropna=False,
        )
        .agg(
            quantidade=("quantidade", "sum"),
            valor_total=("valor_total", "sum"),
        )
    )


def preparar_vendas_consolidadas(df: pd.DataFrame, loja_id: int) -> pd.DataFrame:
    """Valida e consolida integralmente o relat?rio antes da grava??o."""
    if df.empty:
        raise ValueError("O relat?rio de vendas est? vazio.")

    ausentes = [c for c in COLUNAS_OBRIGATORIAS if c not in df.columns]
    if ausentes:
        raise ValueError("Colunas obrigat?rias ausentes: " + ", ".join(ausentes))

    registros = pd.DataFrame({
        "loja_id": loja_id,
        "data": df["DATA_HORA"].map(limpar_data),
        "codigo_produto": df["PRODUTO"].map(normalizar_codigo_produto),
        "descricao": df["DESCRITIVO"].map(limpar_texto),
        "quantidade": df["QTDE"].map(limpar_decimal),
        "valor_total": df["LIQUIDO"].map(limpar_decimal),
    })

    campos = ["data", "codigo_produto", "quantidade", "valor_total"]
    invalidos = registros[campos].isna().any(axis=1)

    if invalidos.any():
        raise ValueError(
            f"Relat?rio cont?m {int(invalidos.sum())} linhas inv?lidas. "
            "Nenhuma venda deve ser substitu?da."
        )

    descricoes = (
        registros.groupby(
            ["loja_id", "data", "codigo_produto"],
            sort=False,
        )["descricao"]
        .first()
        .reset_index()
    )

    consolidado = consolidar_vendas(registros)

    return consolidado.merge(
        descricoes,
        on=["loja_id", "data", "codigo_produto"],
        how="left",
        validate="one_to_one",
    )
