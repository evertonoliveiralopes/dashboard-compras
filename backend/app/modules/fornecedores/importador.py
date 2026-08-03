import pandas as pd
from sqlalchemy.orm import Session

from app.models.fornecedor import Fornecedor
from app.modules.fornecedores.repository import buscar_por_codigo


def limpar_valor(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
        return None

    return valor


def limpar_codigo(valor):
    if pd.isna(valor):
        return None

    try:
        return str(int(float(valor)))
    except Exception:
        return str(valor).strip()


def limpar_cnpj(valor):
    if pd.isna(valor):
        return None

    valor = str(valor).strip()

    if valor == "" or valor.lower() == "nan":
        return None

    valor = (
        valor.replace(".", "")
        .replace("-", "")
        .replace("/", "")
    )

    if valor.endswith(".0"):
        valor = valor[:-2]

    if not valor.isdigit():
        return None

    if int(valor) == 0:
        return None

    if len(valor) != 14:
        return None

    return valor


def importar_dataframe(df: pd.DataFrame, db: Session):

    inseridos = 0
    atualizados = 0

    # Evita inserir duas vezes o mesmo CNPJ durante a mesma importação
    cnpjs_processados = set()

    for _, linha in df.iterrows():

        codigo = limpar_codigo(linha.get("codigo"))

        if not codigo:
            continue

        razao_social = limpar_valor(linha.get("razao_social"))
        nome_fantasia = limpar_valor(linha.get("nome_fantasia"))
        cnpj = limpar_cnpj(linha.get("cnpj"))
        email = limpar_valor(linha.get("email"))
        telefone = limpar_valor(linha.get("telefone"))

        # Ignora CNPJ repetido dentro do próprio arquivo
        if cnpj and cnpj in cnpjs_processados:
            print("=" * 80)
            print("CNPJ REPETIDO NO ARQUIVO")
            print("Código :", codigo)
            print("Razão  :", razao_social)
            print("CNPJ   :", cnpj)
            continue

        fornecedor = None

        # Procura pelo código
        fornecedor = buscar_por_codigo(db, codigo)

        # Se não encontrou, procura pelo CNPJ
        if fornecedor is None and cnpj:
            fornecedor = (
                db.query(Fornecedor)
                .filter(Fornecedor.cnpj == cnpj)
                .first()
            )

        # Atualiza fornecedor existente
        if fornecedor:

            fornecedor.codigo = codigo

            if razao_social:
                fornecedor.razao_social = razao_social

            if nome_fantasia:
                fornecedor.nome_fantasia = nome_fantasia

            if cnpj:
                fornecedor.cnpj = cnpj

            fornecedor.email = email
            fornecedor.telefone = telefone
            fornecedor.ativo = True

            atualizados += 1

        # Insere novo fornecedor
        else:

            print("=" * 80)
            print("NOVO FORNECEDOR")
            print("Código :", codigo)
            print("Razão  :", razao_social)
            print("CNPJ   :", cnpj)

            if cnpj:
                existe = (
                    db.query(Fornecedor)
                    .filter(Fornecedor.cnpj == cnpj)
                    .first()
                )

                print("Existe no banco:", existe is not None)

            novo_fornecedor = Fornecedor(
                codigo=codigo,
                razao_social=razao_social,
                nome_fantasia=nome_fantasia,
                cnpj=cnpj,
                telefone=telefone,
                email=email,
                ativo=True,
            )

            db.add(novo_fornecedor)

            inseridos += 1

        if cnpj:
            cnpjs_processados.add(cnpj)

    try:
        db.commit()

    except Exception:
        db.rollback()
        raise

    return {
        "inseridos": inseridos,
        "atualizados": atualizados,
    }