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