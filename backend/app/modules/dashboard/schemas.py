from pydantic import BaseModel


class CompraMesResponse(BaseModel):
    mes: str
    valor: float