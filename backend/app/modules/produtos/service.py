import csv

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
import pandas as pd

from . import repository

from .importador import importar_dataframe, ler_csv_produtos
from app.models.historico_importacao import HistoricoImportacao



class ProdutoService:

    def importar(self, arquivo: UploadFile, db: Session, loja_id: int):

        try:
            if arquivo.filename.lower().endswith(".csv"):
                df = ler_csv_produtos(arquivo.file.read())
            else:
                df = pd.read_excel(arquivo.file)

            resultado = importar_dataframe(df, db, loja_id)
            db.add(HistoricoImportacao(
                tipo="Produtos",
                loja_id=loja_id,
                arquivo=arquivo.filename,
                registros=len(df),
                inseridos=resultado["inseridos"],
                atualizados=resultado["atualizados"],
                erros=0,
                status="SUCESSO",
            ))
            db.commit()
        except (ValueError, csv.Error) as erro:
            db.rollback()
            raise HTTPException(status_code=422, detail=str(erro)) from erro
        except Exception:
            db.rollback()
            raise

        return resultado
    
    def listar(
        self,
        db: Session,
        busca: str | None = None,
        departamento: str | None = None,
        status: int | None = None,
        offset: int = 0,
        limit: int = 50,
        loja_id: int | None = None,
    ):

        return repository.listar_produtos(
            db=db,
            busca=busca,
            departamento=departamento,
            status=status,
            offset=offset,
            limit=limit,
            loja_id=loja_id,
        )