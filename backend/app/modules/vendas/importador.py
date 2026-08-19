import pandas as pd
from app.utils.codigo_produto import normalizar_codigo_produto
from datetime import datetime
from app.models.historico_importacao import HistoricoImportacao
from app.models.venda import Venda


def limpar_texto(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
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


def limpar_data(valor):
    if pd.isna(valor):
        return None

    if isinstance(valor, datetime):
        return valor.date()

    try:
        return pd.to_datetime(
            valor,
            dayfirst=True
        ).date()

    except:
        return None


def importar_dataframe(
        df: pd.DataFrame,
        db,
        empresa: str,
        nome_arquivo: str,
    ):

    inseridos = 0

    for _, linha in df.iterrows():

        venda = Venda(

            empresa=empresa,

            data=limpar_data(
                linha["DATA"]
            ),

            codigo_produto=normalizar_codigo_produto(
                linha["ID"]
            ),

            descricao=limpar_texto(
                linha["DESCRITIVO"]
            ),

            unidade=limpar_texto(
                linha["UNIDADE_VENDA"]
            ),

            qtde_embalagem=limpar_decimal(
                linha["QTDE_EMBALAGEMS"]
            ),

            quantidade=limpar_decimal(
                linha["QTDE"]
            ),

            valor_unitario=limpar_decimal(
                linha["VALOR_UNITARIO"]
            ),

            valor_total=limpar_decimal(
                linha["VALOR"]
            ),

            custo_unitario=limpar_decimal(
                linha["CUSTO_UNITARIO"]
            ),

            custo_total=limpar_decimal(
                linha["CUSTO"]
            ),

            margem=limpar_decimal(
                linha["MARGEM"]
            ),
        )

        db.add(venda)

        inseridos += 1


        try:

            db.commit()

        except Exception:

            db.rollback()
            raise


        historico = HistoricoImportacao(
            tipo="Vendas",
            arquivo=nome_arquivo,
            registros=len(df),
            inseridos=inseridos,
            atualizados=0,
            erros=0,
            status="SUCESSO",
        )

        db.add(historico)
        db.commit()


        return {
            "status": "ok",
            "registros_importados": inseridos
        }