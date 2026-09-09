from sqlalchemy.orm import Session

from app.models.fornecedor import Fornecedor


def buscar_por_codigo(
    db: Session,
    codigo: str,
):

    return (
        db.query(Fornecedor)
        .filter(
            Fornecedor.codigo == str(codigo)
        )
        .first()
    )


def salvar(
    db: Session,
    fornecedor: Fornecedor,
):

    db.add(fornecedor)
    db.flush()

    return fornecedor


def listar_fornecedores(
    db: Session,
    busca: str | None = None,
    cnpj: str | None = None,
    ativo: bool | None = None,
    offset: int = 0,
    limit: int = 50,
):

    query = db.query(Fornecedor)

    if busca:
        query = query.filter(
            (Fornecedor.codigo.ilike(f"%{busca}%"))
            | (Fornecedor.razao_social.ilike(f"%{busca}%"))
            | (Fornecedor.nome_fantasia.ilike(f"%{busca}%"))
        )

    if cnpj:
        query = query.filter(
            Fornecedor.cnpj.ilike(f"%{cnpj}%")
        )

    if ativo is not None:
        query = query.filter(
            Fornecedor.ativo == ativo
        )

    total = query.count()

    items = (
        query
        .order_by(Fornecedor.razao_social)
        .offset(offset)
        .limit(limit)
        .all()
    )

    resultado = []

    for fornecedor in items:
        resultado.append(
            {
                "id": fornecedor.id,
                "codigo": fornecedor.codigo,
                "razao_social": fornecedor.razao_social,
                "nome_fantasia": fornecedor.nome_fantasia,
                "cnpj": fornecedor.cnpj,
                "telefone": fornecedor.telefone,
                "email": fornecedor.email,
                "ativo": fornecedor.ativo,
            }
        )

    return {
        "items": resultado,
        "total": total,
    }