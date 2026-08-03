from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.database import get_db
from .service import DepartamentoService

router = APIRouter(
    prefix="/departamentos",
    tags=["Departamentos"],
)

service = DepartamentoService()


@router.post("/importar")
async def importar_departamentos(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
):

    try:
        if arquivo.filename.endswith(".csv"):
            df = pd.read_csv(
                arquivo.file,
                sep=";",
                encoding="latin1",
            )
        else:
            df = pd.read_excel(arquivo.file)

        df.columns = (
            df.columns
            .str.strip()
            .str.replace("DescriÃ§Ã£o", "Descrição")
        )

        return service.importar(df, db)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )