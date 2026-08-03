from pandas import DataFrame
from sqlalchemy.orm import Session

from .importador import importar_dataframe


class DepartamentoService:

    def importar(
        self,
        df: DataFrame,
        db: Session,
    ):
        return importar_dataframe(df, db)