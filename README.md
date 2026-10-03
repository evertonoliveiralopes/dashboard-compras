# Compra360

Plataforma web para gestão estratégica de compras, vendas, estoque e fornecedores.

## Objetivo

O Compra360 centraliza dados operacionais do supermercado e os transforma em informações para apoio às decisões de compras, acompanhamento de vendas, estoque e fornecedores.

## Tecnologias

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic

### Frontend
- React
- Vite
- Material UI
- Recharts

### Infraestrutura
- Google Cloud Run
- Google Cloud SQL
- Secret Manager

## Módulos atuais

- Dashboard gerencial
- Produtos
- Fornecedores
- Entradas de mercadorias
- Vendas
- Departamentos
- Importação de relatórios
- Histórico de importações
- Controle por loja
- Autenticação via JWT

## Importação de dados

O sistema possui importadores para os relatórios operacionais utilizados pelo Compra360.

### Entradas

O importador de entradas:

- suporta os layouts de 16 e 18 colunas do relatório Arius;
- normaliza códigos de produtos e fornecedores;
- evita duplicação de entradas e itens já importados;
- utiliza cache em memória para reduzir consultas repetitivas ao banco;
- suporta equivalências conhecidas de códigos históricos de fornecedores;
- registra o resultado no histórico de importações.

### Fornecedores

O importador de fornecedores suporta variações de quantidade de campos encontradas no relatório Arius, preservando os dados cadastrais necessários para identificação dos fornecedores.

### Vendas

O sistema possui histórico de vendas utilizado nos indicadores e análises do dashboard.

## Base histórica validada

### Vendas

A Loja 1 possui histórico de vendas importado de agosto de 2025 a agosto de 2026.

### Compras

A carga histórica de compras da Loja 1 entre agosto e dezembro de 2025 foi validada com:

- 30.989 itens de entrada;
- 0 fornecedores não encontrados;
- 0 produtos não encontrados.

Quantidade de itens por mês:

| Mês | Itens |
| --- | ---: |
| Agosto/2025 | 5.289 |
| Setembro/2025 | 6.343 |
| Outubro/2025 | 6.493 |
| Novembro/2025 | 7.066 |
| Dezembro/2025 | 5.798 |
| **Total** | **30.989** |

O valor de compras utilizado pelo dashboard é calculado a partir de `quantidade × custo_unitario`. Por isso, pode haver pequenas diferenças em relação ao campo de valor total presente no relatório de origem.

## Compatibilidade histórica de fornecedores

Alguns relatórios antigos podem utilizar códigos diferentes dos cadastros atuais.

Atualmente existe a equivalência:

- `20895` → `208959620` — EDY ALIMENTOS.

Transferências recebidas da Empresa 1 são registradas com o fornecedor técnico `E1 - EMPRESA 1 - TRANSFERENCIA ENTRE LOJAS`, pois representam entradas de mercadoria com custo para a loja recebedora.

## Próximas etapas

- Completar o histórico de compras necessário para as análises.
- Refinar os períodos e comparações do dashboard.
- Evoluir os indicadores e alertas gerenciais.
- Continuar a validação dos dados antes da expansão das análises.
