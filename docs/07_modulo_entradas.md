# Compra360 - Módulo de Entradas

# Objetivo

O módulo de Entradas é responsável por registrar todas as notas fiscais de compra importadas do ERP Arius.

Cada entrada representa uma nota fiscal de um fornecedor contendo um ou mais produtos adquiridos.

Este módulo é o principal responsável por alimentar os dashboards de compras.

---

# Responsabilidades

O módulo atualmente é responsável por:

- importar notas fiscais
- criar Entradas
- criar Itens da Entrada
- consultar notas
- consultar detalhes da nota
- calcular valor total da nota
- calcular quantidade de itens
- relacionar fornecedores e produtos

---

# Estrutura

```
app/modules/entradas

├── router.py
├── service.py
├── repository.py
├── schemas.py
└── importador.py
```

---

# Fluxo da importação

```
CSV Arius

↓

Leitura

↓

Fornecedor

↓

Produto

↓

Entrada já existe?

↓

SIM

↓

Utiliza a entrada existente

↓

NÃO

↓

Cria nova Entrada

↓

Cria ItemEntrada

↓

Commit
```

---

# Modelo Entrada

Tabela

```
entradas
```

Campos

| Campo | Descrição |
|--------|-----------|
| id | Identificador |
| empresa | Loja |
| data_entrada | Data da nota |
| fornecedor_id | Fornecedor |
| nota_fiscal | Número da nota |
| chave_nfe | Chave da NF-e |
| lancamento_fiscal | Controle fiscal |
| processo_entrada | Processo |
| tipo_movimento | Tipo de movimento |

---

# Modelo ItemEntrada

Tabela

```
itens_entrada
```

Campos

| Campo | Descrição |
|--------|-----------|
| id | Identificador |
| entrada_id | Nota Fiscal |
| produto_id | Produto |
| quantidade | Quantidade comprada |
| custo | Custo unitário |
| custo_nota | Custo informado |
| descricao_produto | Descrição do arquivo |
| validade | Validade |
| bonificacao | Bonificação |

---

# Relacionamentos

Fornecedor

↓

Entrada

↓

ItemEntrada

↓

Produto

Representação

```
Fornecedor

1

↓

N

Entrada

1

↓

N

ItemEntrada

N

↓

1

Produto
```

---

# Consultas disponíveis

## Listar Entradas

```
GET /entradas
```

Retorna

- fornecedor
- nota
- data
- quantidade de itens

---

## Detalhes da Entrada

```
GET /entradas/{id}
```

Retorna

- dados da nota
- fornecedor
- lista de produtos
- quantidade
- custo
- subtotal
- valor total

---

# Dados apresentados

Cada entrada possui:

```
Fornecedor

Nota Fiscal

Data

Quantidade de itens

Valor total
```

---

# Cálculos

Quantidade de itens

```
COUNT(ItemEntrada)
```

---

Valor total

```
SUM(
quantidade × custo
)
```

---

Subtotal

```
quantidade × custo
```

---

# Regras de importação

Uma entrada é considerada única por:

```
empresa

+

nota_fiscal

+

fornecedor_id
```

Caso já exista:

```
não cria novamente
```

---

Itens

Antes de inserir um ItemEntrada o sistema verifica:

```
entrada_id

+

produto_id
```

Caso já exista:

```
não duplica
```

---

# Situação atual

Implementado

✅ Importação

✅ Cadastro automático

✅ Relacionamento fornecedor

✅ Relacionamento produto

✅ Consulta geral

✅ Consulta detalhada

✅ Valor total

✅ Quantidade de itens

✅ Evita duplicidade

---

# Melhorias previstas

Este módulo futuramente armazenará também:

- XML da NF-e
- Condição de pagamento
- Frete
- ICMS
- IPI
- Descontos
- Comprador responsável
- Centro de custo
- Conferência da nota
- Divergências
- Histórico de alterações
- Anexos da compra
- Aprovação da compra

---

# Papel no Compra360

O módulo de Entradas é a principal fonte de dados para:

- Dashboard Executivo
- Radar do Comprador
- Evolução de Custos
- Curva ABC
- Ranking de Fornecedores
- Histórico de Compras
- Comparativo de Custos
- Sugestão de Compras
- Análise de Margem
