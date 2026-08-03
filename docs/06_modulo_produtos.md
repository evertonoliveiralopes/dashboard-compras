# Compra360 - Módulo de Produtos

# Objetivo

O módulo de produtos é responsável pelo gerenciamento do cadastro de produtos utilizados pelo Compra360.

Além de armazenar os produtos importados do ERP Arius, este módulo será a base para praticamente todos os dashboards e indicadores do sistema.

---

# Responsabilidades

O módulo atualmente é responsável por:

- importar produtos
- consultar produtos
- localizar produtos pelo código Arius
- relacionar produtos com fornecedores
- relacionar produtos com itens de entrada

---

# Estrutura

```
app/modules/produtos

├── router.py
├── service.py
├── repository.py
├── schemas.py
└── importador.py
```

---

# Modelo

Tabela:

```
produtos
```

Campos principais

| Campo | Descrição |
|--------|-----------|
| id | Identificador interno |
| codigo | Código do Arius |
| descricao | Nome do produto |
| departamento | Departamento |
| fornecedor_id | Fornecedor principal |
| custo | Último custo |
| preco_venda | Preço de venda |
| estoque | Estoque atual |
| estoque_minimo | Estoque mínimo |
| ativo | Produto ativo |

---

# Relacionamentos

Fornecedor

↓

Produtos

Relacionamento

```
Fornecedor 1:N Produto
```

---

Produto

↓

Itens da Entrada

Relacionamento

```
Produto 1:N ItemEntrada
```

---

Fluxo completo

```
Fornecedor

↓

Produto

↓

Item Entrada

↓

Entrada
```

---

# Repository

Principais funções

Buscar produto

```python
buscar_produto(
    db,
    codigo
)
```

Retorna

```
Produto
```

ou

```
None
```

---

# API

Consulta geral

```
GET /produtos
```

Consulta individual

```
GET /produtos/{id}
```

Importação

```
POST /produtos/importar
```

---

# Uso durante a importação de entradas

Cada linha do arquivo Arius contém um código de produto.

Fluxo:

```
Código produto

↓

Normalização

↓

Buscar produto

↓

Produto encontrado

↓

Criar ItemEntrada
```

O ItemEntrada guarda apenas o ID do produto, mantendo o banco normalizado.

---

# Situação atual

Implementado

✅ Cadastro de produtos

✅ Importação

✅ Consulta

✅ Busca por código

✅ Relacionamento com fornecedor

✅ Relacionamento com ItemEntrada

---

# Indicadores futuros

Este módulo será utilizado para gerar:

- Curva ABC
- Giro de estoque
- Cobertura de estoque
- Sugestão de compra
- Evolução de custos
- Histórico de preços
- Produtos sem movimentação
- Produtos com maior aumento de custo
- Produtos com maior redução de custo
- Comparativo entre fornecedores
- Produtos em ruptura
- Produtos próximos ao estoque mínimo

---

# Melhorias planejadas

Próximas versões deverão incluir:

- Pesquisa por descrição
- Pesquisa por departamento
- Pesquisa por fornecedor
- Pesquisa por código de barras
- Imagem do produto
- Unidade de compra
- Unidade de venda
- Conversão entre embalagens
- Histórico completo de custos
- Histórico de fornecedores
- Dashboard individual do produto