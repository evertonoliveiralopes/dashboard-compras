# Compra360 - Visão Geral do Projeto

## Objetivo

O Compra360 é um sistema de inteligência para o setor de compras, desenvolvido para transformar os dados do ERP Arius em informações estratégicas para tomada de decisão.

O sistema tem como objetivo centralizar informações de compras, fornecedores, produtos, entradas e indicadores gerenciais.

---

# Objetivos principais

- Melhorar a análise de compras
- Reduzir dependência de consultas manuais no ERP
- Criar indicadores para compradores
- Acompanhar evolução de custos
- Analisar fornecedores
- Facilitar decisões comerciais

---

# Tecnologias utilizadas

## Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- Pandas

## Frontend

- React
- Vite

---

# Status atual do projeto

## Backend

Implementado:

✅ Estrutura inicial FastAPI  
✅ Conexão PostgreSQL  
✅ Models SQLAlchemy  
✅ Migrações Alembic  
✅ Cadastro de fornecedores  
✅ Cadastro de produtos  
✅ Importação de dados Arius  
✅ Importação de entradas de notas fiscais  
✅ Relacionamento:

Fornecedor → Entrada → Item Entrada → Produto

✅ APIs de consulta de entradas

---

# Estrutura atual de dados

O sistema trabalha atualmente com:

- Fornecedores
- Produtos
- Entradas de mercadorias
- Itens das entradas

Cada entrada possui:

- Empresa
- Nota fiscal
- Data de entrada
- Fornecedor
- Produtos recebidos
- Quantidade
- Custo

---

# Decisões importantes do projeto

## Multi-loja

O sistema será preparado para trabalhar com várias lojas.

A ideia definida é:

- Usuário seleciona a loja ao entrar no sistema
- Relatórios poderão permitir seleção de uma ou mais lojas

Modelo semelhante ao funcionamento do ERP Arius.

---

# Próximas evoluções

- Construção do frontend React
- Tela inicial do sistema
- Seleção de loja
- Dashboard de compras
- Relatórios gerenciais
- Indicadores de compradores
- Radar do comprador
- Análises de fornecedores