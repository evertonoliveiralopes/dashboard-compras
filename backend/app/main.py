from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.produtos.router import router as produtos_router
from app.modules.fornecedores.router import router as fornecedores_router
from app.modules.vendas.router import router as vendas_router
from app.modules.entradas.router import router as entradas_router
from app.modules.auth.router import router as auth_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.departamentos.router import router as departamentos_router
from app.modules.config_alertas.router import router as config_alertas_router



app = FastAPI(
    title="Dashboard de Compras",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://compra360-frontend-56786735553.southamerica-east1.run.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(produtos_router)
app.include_router(fornecedores_router)
app.include_router(vendas_router)
app.include_router(entradas_router)
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(departamentos_router)
app.include_router(config_alertas_router)


@app.get("/")
def home():
    return {
        "status": "Banco conectado com sucesso!"
    }