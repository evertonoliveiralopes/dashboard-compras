# Compra360 - Banco de Dados

## Banco utilizado

O Compra360 utiliza PostgreSQL como banco de dados principal.

Configuração atual:

- Banco: PostgreSQL
- ORM: SQLAlchemy
- Controle de versão: Alembic

---

# Modelo de dados

A estrutura atual foi criada pensando no fluxo de compras:

Fornecedor → Entrada → Item Entrada → Produto

Representação:
Fornecedor
     |
     | 1:N
     |
Entrada
     |
     | 1:N
     |
ItemEntrada
     |
     | N:1
     |
Produto


---

# Tabelas atuais

## fornecedores

Tabela responsável pelo cadastro dos fornecedores.

Campos principais:

| Campo | Tipo | Descrição |
|---|---|---|
| id | Integer | Identificador interno |
| codigo | String | Código do fornecedor no Arius |
| razao_social | String | Razão social |
| nome_fantasia | String | Nome comercial |
| cnpj | String | CNPJ |
| telefone | String | Telefone |
| email | String | Email |
| ativo | Boolean | Controle de status |

---

# produtos

Tabela responsável pelo cadastro dos produtos.

Campos principais:

| Campo | Tipo | Descrição |
|---|---|---|
| id | Integer | Identificador interno |
| codigo | String | Código do produto no Arius |
| descricao | String | Descrição do produto |
| departamento | String | Departamento |
| fornecedor_id | Integer | Fornecedor relacionado |
| custo | Float | Custo atual |
| preco_venda | Float | Preço de venda |
| estoque | Float | Estoque atual |
| estoque_minimo | Float | Estoque mínimo |
| ativo | Boolean | Status do produto |

---

# entradas

Tabela responsável pelo registro das notas fiscais de entrada.

Cada registro representa uma compra realizada.

Campos:

| Campo | Tipo | Descrição |
|---|---|---|
| id | Integer | Identificador |
| empresa | Integer | Loja/empresa |
| data_entrada | Date | Data da entrada |
| fornecedor_id | Integer | Fornecedor da nota |
| nota_fiscal | String | Número da nota |
| chave_nfe | String | Chave da NF-e |
| lancamento_fiscal | String | Informação fiscal |
| processo_entrada | String | Processo interno |
| tipo_movimento | String | Tipo da entrada |

---

# itens_entrada

Tabela responsável pelos produtos existentes dentro de cada nota fiscal.

Relaciona:

- Entrada
- Produto

Campos:

| Campo | Tipo | Descrição |
|---|---|---|
| id | Integer | Identificador |
| entrada_id | Integer | Entrada relacionada |
| produto_id | Integer | Produto relacionado |
| quantidade | Float | Quantidade recebida |
| custo | Float | Custo unitário |
| custo_nota | Float | Custo informado na nota |
| descricao_produto | String | Descrição no arquivo |
| condicao_pagamento | String | Condição pagamento |
| validade | Date | Validade |
| tipo_embalagem | String | Embalagem |
| bonificacao | String | Produto bonificado |

---

# Relacionamentos

## Fornecedor → Entrada

Um fornecedor pode possuir várias entradas.

Exemplo:
COCA COLA
    |
    ├── NF 2420565
    ├── NF 2420566
    ├── NF 2420567


Relacionamento:
Fornecedor 1:N Entrada


---

## Entrada → ItemEntrada

Uma nota fiscal possui vários produtos.

Exemplo:
NF 21665
├── Alface Lisa
├── Couve Flor
├── Agrião
└── Espinafre


Relacionamento:
Entrada 1:N ItemEntrada


---

## Produto → ItemEntrada

Um produto pode aparecer em várias compras.

Exemplo:
Alface Crespa
Compra 01
Compra 02
Compra 03


Relacionamento:
Produto 1:N ItemEntrada


---

# Validações realizadas

## Entradas importadas

Após importação do arquivo Arius:

Resultado validado:
Entradas criadas: 22
Itens criados: 141


---

## Consulta de entradas

Exemplo:

Entrada:
Nota fiscal: 21665
Fornecedor: VERDEMAR HORTALICAS


Resultado:
Total itens: 12
Valor total: 1127,30


---

# Regras importantes

## Chave da entrada

Uma entrada é identificada por:
empresa
+
nota_fiscal
+
fornecedor_id


Essa regra evita duplicidade de notas.

---

# Preparação futura

O banco foi estruturado para receber novas funcionalidades:

- Histórico de preços
- Evolução de custos
- Comparação de fornecedores
- Indicadores de compradores
- Dashboard gerencial
- Multi-lojas
- Relatórios consolidados