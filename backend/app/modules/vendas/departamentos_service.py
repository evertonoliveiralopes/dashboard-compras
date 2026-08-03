from sqlalchemy.orm import Session
from sqlalchemy import text


def listar_departamentos(db: Session):

    sql = text("""
        SELECT DISTINCT
            departamento
        FROM produtos
        WHERE departamento IS NOT NULL
        ORDER BY departamento
    """)

    return db.execute(sql).fetchall()