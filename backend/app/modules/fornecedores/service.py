from app.modules.fornecedores.leitores.csv_reader import ler_csv
from app.modules.fornecedores.leitores.excel_reader import ler_excel
from app.modules.fornecedores.normalizadores.arius import normalizar
from app.modules.fornecedores import repository
from sqlalchemy.orm import Session

def ler_arquivo(arquivo):

    nome = arquivo.filename.lower()

    if nome.endswith(".csv"):
        df = ler_csv(arquivo)
        return normalizar(df)

    if nome.endswith(".xlsx"):
        df = ler_excel(arquivo)
        return normalizar(df)

    raise Exception("Formato não suportado.")

def listar(
    db: Session,
    busca: str | None = None,
    cnpj: str | None = None,
    ativo: bool | None = None,
    offset: int = 0,
    limit: int = 50,
):

    return repository.listar_fornecedores(
        db=db,
        busca=busca,
        cnpj=cnpj,
        ativo=ativo,
        offset=offset,
        limit=limit,
    )