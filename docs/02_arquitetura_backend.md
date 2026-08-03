# Compra360 - Arquitetura Backend

## Visão geral

O backend do Compra360 foi desenvolvido utilizando FastAPI, seguindo uma arquitetura modular.

A organização foi criada para separar responsabilidades entre:

- Modelos de banco de dados
- Regras de negócio
- Rotas da API
- Serviços de importação
- Repositórios de acesso ao banco

---

# Tecnologias

## Linguagem

Python

## Framework

FastAPI

## Banco de dados

PostgreSQL

## ORM

SQLAlchemy

## Migrações

Alembic

## Manipulação de dados

Pandas

---

# Estrutura principal
backend
│
├── app
│   │
│   ├── database.py
│   │
│   ├── models
│   │
│   ├── modules
│   │   │
│   │   ├── fornecedores
│   │   │
│   │   ├── produtos
│   │   │
│   │   ├── entradas
│   │   │
│   │   └── importacao
│   │
│   ├── routes
│   │
│   ├── utils
│   │
│   └── main.py
│
├── alembic
│
├── requirements.txt
│
└── venv


---

# Arquivo principal

## main.py

Responsável por:

- Inicializar a aplicação FastAPI
- Registrar os módulos
- Disponibilizar documentação automática da API

Documentação:
http://127.0.0.1:8000/docs


---

# Camada de banco

## database.py

Responsável por:

- Configuração da conexão PostgreSQL
- Criação da sessão SQLAlchemy
- Base dos modelos

---

# Models

Local:
app/models


Responsáveis pela representação das tabelas do banco.

Modelos atuais:

## Fornecedor

Representa os fornecedores cadastrados.

Principais campos:

- Código
- Razão social
- Nome fantasia
- CNPJ
- Contatos
- Status


## Produto

Representa os produtos utilizados no sistema.

Principais campos:

- Código
- Descrição
- Departamento
- Custo
- Preço de venda
- Estoque


## Entrada

Representa documentos de entrada de mercadoria.

Principais campos:

- Empresa
- Nota fiscal
- Data entrada
- Fornecedor


## ItemEntrada

Representa os produtos pertencentes a uma entrada.

Principais campos:

- Produto
- Quantidade
- Custo
- Valor da nota

---

# Módulos

## fornecedores

Responsável pelo gerenciamento de fornecedores.

Possui:

- Importação
- Consultas
- Serviços
- Repositórios
- Rotas


## produtos

Responsável pelo cadastro e consultas de produtos.


## entradas

Responsável pelo controle das entradas de mercadorias.

Funções atuais:

- Importação de notas
- Criação das entradas
- Criação dos itens
- Consulta detalhada


## importacao

Responsável pelo processamento dos arquivos vindos do Arius.

Possui:

- Leitores CSV/XLSX
- Normalizadores
- Serviços de importação

---

# Fluxo atual de importação
Arquivo Arius
      |
      ↓
Upload pela API
      |
      ↓
Leitura Pandas
      |
      ↓
Normalização dos códigos
      |
      ↓
Busca fornecedor
      |
      ↓
Busca produto
      |
      ↓
Criação Entrada
      |
      ↓
Criação ItemEntrada
      |
      ↓
PostgreSQL


---

# Padrões utilizados

## Repository Pattern

O acesso ao banco é separado em arquivos repository.

Exemplo:
buscar_fornecedor()
buscar_produto()
buscar_entrada()

---

## Separação por módulo

Cada área possui sua própria estrutura:
router
service
repository
schemas
importador


Essa organização facilita manutenção e crescimento do sistema.

---

# Estado atual

Backend funcional com:

✅ API funcionando  
✅ Banco conectado  
✅ Importação Arius funcionando  
✅ Relacionamento fornecedor/produto/entrada funcionando  
✅ Consulta detalhada de entrada funcionando  

Próxima evolução:

Construção das telas React consumindo as APIs existentes.