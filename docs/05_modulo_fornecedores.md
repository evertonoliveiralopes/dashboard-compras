# Compra360 - Módulo de Fornecedores

# Objetivo

O módulo de fornecedores é responsável pelo gerenciamento dos fornecedores cadastrados no Compra360.

Além de servir como cadastro, ele é utilizado durante todas as importações do Arius para relacionar corretamente cada nota fiscal ao seu respectivo fornecedor.

---

# Responsabilidades

O módulo atualmente é responsável por:

- importar fornecedores
- consultar fornecedores
- localizar fornecedor pelo código Arius
- servir de relacionamento para Entradas
- servir de relacionamento para Produtos

---

# Estrutura do módulo

```
app/modules/fornecedores

├── router.py
├── service.py
├── repository.py
├── schemas.py
└── importador.py
```

---

# Fluxo de importação

Arquivo Arius

↓

Leitura CSV

↓

Normalização

↓

Busca fornecedor

↓

Se existe

↓

Atualiza informações

ou

↓

Cria novo fornecedor

↓

Banco de dados

---

# Modelo utilizado

Tabela:

```
fornecedores
```

Principais campos

| Campo | Descrição |
|--------|-----------|
| id | Identificador interno |
| codigo | Código do Arius |
| razao_social | Razão Social |
| nome_fantasia | Nome Fantasia |
| cnpj | CNPJ |
| telefone | Telefone |
| email | Email |
| ativo | Status |

---

# Relacionamentos

Fornecedor possui vários Produtos

```
Fornecedor

↓

Produtos
```

Relacionamento:

```
Fornecedor 1:N Produto
```

---

Fornecedor possui várias Entradas

```
Fornecedor

↓

Entradas
```

Relacionamento:

```
Fornecedor 1:N Entrada
```

---

# Repository

Principais consultas

## Buscar fornecedor

```python
buscar_fornecedor(
    db,
    codigo
)
```

Retorna:

```
Fornecedor
```

ou

```
None
```

---

# API

Importação

```
POST /fornecedores/importar
```

Consulta

```
GET /fornecedores
```

Consulta individual

```
GET /fornecedores/{id}
```

*(Os endpoints podem ser ampliados conforme o projeto evoluir.)*

---

# Uso durante a importação de entradas

Durante a leitura do arquivo Arius:

```
Código fornecedor

↓

Normalizar

↓

Buscar fornecedor

↓

Fornecedor encontrado

↓

Criar Entrada
```

Sem essa etapa não é possível criar corretamente uma Entrada.

---

# Situação atual

Implementado:

✅ Importação

✅ Consulta

✅ Busca por código

✅ Relacionamento com Produtos

✅ Relacionamento com Entradas

---

# Melhorias futuras

Planejadas para próximas versões:

- Pesquisa por nome
- Pesquisa por CNPJ
- Histórico de compras
- Ranking de fornecedores
- Curva ABC por fornecedor
- Prazo médio de entrega
- Lead Time
- Performance de fornecimento
- Dashboard individual do fornecedor