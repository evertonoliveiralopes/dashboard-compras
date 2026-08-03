# Compra360 - Dashboard Executivo

# Objetivo

O Dashboard Executivo será a tela principal do Compra360.

Seu objetivo é fornecer ao comprador e aos gestores uma visão rápida, consolidada e inteligente de todas as compras realizadas pela empresa.

Toda a navegação do sistema partirá deste painel.

---

# Conceito

O Dashboard deve responder rapidamente perguntas como:

- Quanto foi comprado hoje?
- Qual fornecedor vendeu mais?
- Quais produtos tiveram maior aumento de custo?
- Quais departamentos compraram mais?
- Existe alguma ruptura de estoque?
- Qual comprador está comprando melhor?
- Qual loja comprou mais?

---

# Estrutura da tela

```
+------------------------------------------------------+
| Logo Compra360           Loja: [ Todas ▼ ]           |
+------------------------------------------------------+

 KPIs

 Total Comprado
 Economia
 Notas
 Produtos
 Fornecedores

--------------------------------------------------------

Compras por Departamento

--------------------------------------------------------

Compras por Fornecedor

--------------------------------------------------------

Últimas Entradas

--------------------------------------------------------

Radar do Comprador

--------------------------------------------------------

Alertas
```

---

# Filtros

O dashboard deverá possuir filtros globais.

## Loja

Será possível selecionar:

- uma loja
- várias lojas
- todas as lojas

---

## Período

Filtros rápidos

Hoje

Ontem

7 dias

15 dias

30 dias

Mês atual

Mês anterior

Ano

Personalizado

---

## Departamento

Todos

ou

Departamento específico

---

## Fornecedor

Pesquisa por nome

---

## Comprador

Pesquisa por comprador

---

# Indicadores principais (KPIs)

## Valor comprado

Exemplo

```
R$ 2.450.000
```

---

## Número de notas

Exemplo

```
1.245 notas
```

---

## Produtos comprados

Quantidade de itens adquiridos.

---

## Fornecedores ativos

Número de fornecedores com compras no período.

---

## Ticket médio da nota

```
Valor Comprado

÷

Quantidade de Notas
```

---

## Economia

Diferença entre:

Preço atual

x

Preço histórico

---

# Gráfico

Compras por dia

Linha mostrando a evolução diária das compras.

---

# Compras por departamento

Gráfico de barras

Exemplo

```
Mercearia

██████████

Perecíveis

███████

Bebidas

████████████
```

---

# Compras por fornecedor

Ranking

Fornecedor

Valor comprado

Quantidade de notas

Participação

---

# Últimas entradas

Tabela

Data

Fornecedor

Nota

Valor

Quantidade de itens

Clique para abrir detalhes.

---

# Alertas

Exemplos

Produtos com aumento superior a 15%

Produtos sem compra há mais de 30 dias

Produtos abaixo do estoque mínimo

Produtos sem fornecedor

Notas importadas com erro

---

# Navegação

A partir do Dashboard será possível acessar:

Fornecedor

Produto

Entrada

Radar do Comprador

Relatórios

Estoque

Indicadores

---

# Performance

O Dashboard deverá carregar em poucos segundos.

Estratégias:

- consultas otimizadas
- paginação
- agregações SQL
- índices
- cache (futuro)

---

# Layout

Tema

Azul

Branco

Cinza claro

Visual moderno semelhante a Power BI e ERP corporativo.

---

# Responsividade

Funcionará em:

Desktop

Notebook

Tablet

Em dispositivos móveis será apresentada uma versão simplificada.

---

# Evoluções futuras

- Metas de compra
- Comparativo entre lojas
- Indicadores financeiros
- Widgets configuráveis
- Exportação para Excel
- Exportação para PDF
- Compartilhamento de dashboards
- Favoritos
- Dashboard personalizado por usuário