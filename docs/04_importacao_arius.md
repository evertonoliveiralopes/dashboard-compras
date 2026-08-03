# Compra360 - Importação de Arquivos Arius

# Objetivo

O módulo de importação é responsável por receber os arquivos exportados do ERP Arius e transformá-los em dados estruturados dentro do PostgreSQL.

O processo realiza automaticamente:

- leitura do arquivo
- normalização dos dados
- localização dos fornecedores
- localização dos produtos
- criação das entradas
- criação dos itens da entrada

---

# Fluxo completo

```
Arquivo CSV Arius
        │
        ▼
Upload pela API
        │
        ▼
Leitura com Pandas
        │
        ▼
Remoção do cabeçalho exportado
        │
        ▼
Normalização dos códigos
        │
        ▼
Busca do fornecedor
        │
        ▼
Busca do produto
        │
        ▼
Verifica se a entrada já existe
        │
        ├─────────────► Existe
        │                 │
        │                 ▼
        │           reutiliza entrada
        │
        ▼
Não existe
        │
        ▼
Cria nova entrada
        │
        ▼
Cria ItemEntrada
        │
        ▼
Commit
```

---

# Arquivo de entrada

Atualmente a importação recebe arquivos CSV exportados pelo Arius.

Leitura realizada com:

- Pandas
- encoding latin1
- separador ","

```python
pd.read_csv(
    arquivo.file,
    sep=",",
    encoding="latin1",
    header=None,
    engine="python"
)
```

---

# Colunas utilizadas

O arquivo é convertido para as seguintes colunas:

| Campo |
|--------|
| nota_fiscal |
| tipo |
| mes |
| ano |
| data_entrada |
| cfop |
| coi |
| codigo_fornecedor |
| codigo_produto |
| descricao_produto |
| emb |
| quantidade |
| emb_saida |
| custo_unitario |
| coluna_extra |
| valor_total |

---

# Limpeza dos dados

Antes da importação são realizadas algumas validações.

## Remove cabeçalho

```python
df = df[df["codigo_fornecedor"] != "PART."]
```

---

## Remove linhas inválidas

A nota fiscal precisa ser numérica.

```python
df = df[
    pd.to_numeric(
        df["nota_fiscal"],
        errors="coerce"
    ).notna()
]
```

---

# Normalização

Os códigos do Arius chegam com formatos diferentes.

Exemplos:

Fornecedor

```
F1575
```

↓

```
1575
```

Produto

```
00194600
```

↓

```
194600
```

As funções utilizadas são:

```
normalizar_codigo_fornecedor()

normalizar_codigo_produto()
```

---

# Busca do fornecedor

Após normalização é realizada consulta:

```python
buscar_fornecedor()
```

Resultado esperado:

```
Fornecedor encontrado
```

ou

```
Fornecedor não encontrado
```

---

# Busca do produto

Da mesma forma:

```python
buscar_produto()
```

Caso localizado:

- utiliza o ID interno

Caso contrário:

- contabiliza como não encontrado

---

# Criação da entrada

Antes de criar uma nova entrada é feita uma validação.

Busca:

```
empresa
+
nota_fiscal
+
fornecedor_id
```

Se existir:

```
reutiliza
```

Se não existir:

```
cria nova Entrada
```

---

# Criação dos itens

Cada linha do CSV representa um ItemEntrada.

São gravados:

- entrada
- produto
- quantidade
- custo
- custo da nota
- descrição

---

# Conversão de números

Quantidade

```
160,000
```

↓

```
160.000
```

Custo

```
3,50
```

↓

```
3.50
```

As conversões removem separadores brasileiros para Float.

---

# Commit

Ao final do processamento:

```python
db.commit()
```

---

# Resultado da importação

A API retorna um resumo.

Exemplo:

```json
{
  "mensagem": "Importação concluída",
  "entradas_criadas": 22,
  "itens_criados": 141,
  "fornecedores_encontrados": 141,
  "fornecedores_nao_encontrados": 0,
  "produtos_encontrados": 141,
  "produtos_nao_encontrados": 0
}
```

---

# Validações realizadas

Durante o desenvolvimento foram confirmados:

✅ Importação de fornecedores

✅ Importação de produtos

✅ Importação de entradas

✅ Relacionamento Entrada → ItemEntrada

✅ Evita duplicação de entradas

✅ Evita duplicação de itens

---

# Evoluções previstas

O módulo já foi preparado para futuras melhorias:

- Importação por XLSX
- Importação em lote
- Barra de progresso
- Histórico de importações
- Reprocessamento de arquivos
- Log detalhado de erros
- Importação por múltiplas empresas