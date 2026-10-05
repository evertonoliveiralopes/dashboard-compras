import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";

import UltimasImportacoes from "../../components/dashboard/widgets/UltimasImportacoes";

import {
  importarProdutos,
  importarDepartamentos,
  importarFornecedores,
  importarEntradas,
  importarVendas,
} from "../../services/importacaoService";


const TIPOS_IMPORTACAO = {
  produtos: {
    titulo: "Produtos",
    descricao:
      "Importe os produtos exportados pelo sistema Arius.",
    requerLoja: true,
  },
  departamentos: {
    titulo: "Departamentos",
    descricao:
      "Importe os departamentos exportados pelo sistema Arius.",
    requerLoja: false,
  },
  fornecedores: {
    titulo: "Fornecedores",
    descricao:
      "Importe os fornecedores exportados pelo sistema Arius.",
    requerLoja: false,
  },
  entradas: {
    titulo: "Entradas",
    descricao:
      "Importe as entradas de mercadorias exportadas pelo sistema Arius.",
    requerLoja: true,
  },
  vendas: {
    titulo: "Vendas",
    descricao:
      "Importe o relatório de vendas exportado pelo sistema Arius.",
    requerLoja: true,
  },
};


export default function Importacoes() {
  const [lojaSelecionada, setLojaSelecionada] = useState(() => {
    const loja = localStorage.getItem("lojaSelecionada");

    return loja ? JSON.parse(loja) : null;
  });

  const [tipoImportacao, setTipoImportacao] =
    useState("produtos");

  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [atualizacaoHistorico, setAtualizacaoHistorico] = useState(0);


  useEffect(() => {
    const atualizarLoja = (evento) => {
      setLojaSelecionada(evento.detail);
    };

    window.addEventListener(
      "lojaSelecionadaAlterada",
      atualizarLoja
    );

    return () => {
      window.removeEventListener(
        "lojaSelecionadaAlterada",
        atualizarLoja
      );
    };
  }, []);


  const configuracao =
    TIPOS_IMPORTACAO[tipoImportacao];


  function alterarTipo(evento) {
    setTipoImportacao(evento.target.value);
    setArquivo(null);
    setResultado(null);
    setErro("");
  }


  function selecionarArquivo(evento) {
    const arquivoSelecionado =
      evento.target.files?.[0];

    if (!arquivoSelecionado) {
      return;
    }

    setArquivo(arquivoSelecionado);
    setResultado(null);
    setErro("");
  }


  function removerArquivo() {
    setArquivo(null);
    setResultado(null);
    setErro("");
  }


  async function executarImportacao() {
    switch (tipoImportacao) {
      case "produtos":
        return importarProdutos(
          arquivo,
          lojaSelecionada.id
        );

      case "departamentos":
        return importarDepartamentos(
          arquivo
        );

      case "fornecedores":
        return importarFornecedores(
          arquivo
        );

      case "entradas":
        return importarEntradas(
          arquivo,
          lojaSelecionada.id
        );

      case "vendas":
        return importarVendas(
          arquivo,
          lojaSelecionada.id
        );

      default:
        throw new Error(
          "Tipo de importação inválido."
        );
    }
  }


  async function handleImportar() {
    if (
      configuracao.requerLoja &&
      !lojaSelecionada
    ) {
      setErro(
        `Selecione uma loja antes de importar ${configuracao.titulo.toLowerCase()}.`
      );
      return;
    }

    if (!arquivo) {
      setErro(
        "Selecione um arquivo para importar."
      );
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      setResultado(null);

      const dados = await executarImportacao();

      setResultado(dados);
      setArquivo(null);
      setAtualizacaoHistorico((valor) => valor + 1);
    } catch (error) {
      console.error(
        `Erro ao importar ${tipoImportacao}:`,
        error
      );

      setErro(
        error.response?.data?.detail ||
          error.message ||
          "Não foi possível realizar a importação."
      );
    } finally {
      setCarregando(false);
    }
  }


  function renderizarResultado() {
    if (!resultado) {
      return null;
    }

    if (
      tipoImportacao === "produtos" ||
      tipoImportacao === "departamentos" ||
      tipoImportacao === "fornecedores"
    ) {
      return (
        <>
          <Typography variant="body2">
            Inseridos: {resultado.inseridos ?? 0}
          </Typography>

          <Typography variant="body2">
            Atualizados: {resultado.atualizados ?? 0}
          </Typography>
        </>
      );
    }

    if (tipoImportacao === "entradas") {
      return (
        <>
          <Typography variant="body2">
            Entradas criadas:{" "}
            {resultado.entradas_criadas ?? 0}
          </Typography>

          <Typography variant="body2">
            Itens criados:{" "}
            {resultado.itens_criados ?? 0}
          </Typography>

          <Typography variant="body2">
            Fornecedores encontrados:{" "}
            {resultado.fornecedores_encontrados ?? 0}
          </Typography>

          <Typography variant="body2">
            Fornecedores não encontrados:{" "}
            {resultado.fornecedores_nao_encontrados ?? 0}
          </Typography>

          <Typography variant="body2">
            Produtos encontrados:{" "}
            {resultado.produtos_encontrados ?? 0}
          </Typography>

          <Typography variant="body2">
            Produtos não encontrados:{" "}
            {resultado.produtos_nao_encontrados ?? 0}
          </Typography>
        </>
      );
    }

    if (tipoImportacao === "vendas") {
      return (
        <>
          <Typography variant="body2">
            Registros importados:{" "}
            {resultado.registros_importados ?? 0}
          </Typography>

          {resultado.partes_processadas != null && (
            <Typography variant="body2">
              Partes processadas:{" "}
              {resultado.partes_processadas}
            </Typography>
          )}

          {resultado.erros != null &&
            resultado.erros > 0 && (
              <Typography variant="body2">
                Erros: {resultado.erros}
              </Typography>
            )}
        </>
      );
    }

    return null;
  }


  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight="600"
        sx={{ mb: 3 }}
      >
        Central de Importações
      </Typography>

      <Paper
        elevation={2}
        sx={{
          p: 3,
          maxWidth: 900,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="600"
        >
          Nova importação
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          Selecione o tipo de informação que deseja
          importar e envie o arquivo correspondente.
        </Typography>

        <FormControl
          fullWidth
          size="small"
          sx={{ mb: 3 }}
        >
          <InputLabel id="tipo-importacao-label">
            Tipo da importação
          </InputLabel>

          <Select
            labelId="tipo-importacao-label"
            value={tipoImportacao}
            label="Tipo da importação"
            onChange={alterarTipo}
            disabled={carregando}
          >
            {Object.entries(
              TIPOS_IMPORTACAO
            ).map(([valor, item]) => (
              <MenuItem
                key={valor}
                value={valor}
              >
                {item.titulo}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {configuracao.descricao}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <UploadFileIcon
            sx={{
              fontSize: 48,
              color: "text.secondary",
              mb: 1,
            }}
          />

          <Typography sx={{ mb: 2 }}>
            Selecione o arquivo de{" "}
            {configuracao.titulo.toLowerCase()}
          </Typography>

          <Button
            variant="outlined"
            component="label"
            disabled={carregando}
          >
            Selecionar arquivo

            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xls"
              onChange={selecionarArquivo}
            />
          </Button>
        </Box>

        {arquivo && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                fontWeight="600"
                noWrap
              >
                Arquivo selecionado
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
              >
                {arquivo.name}
              </Typography>
            </Box>

            <Button
              color="error"
              startIcon={<CloseIcon />}
              onClick={removerArquivo}
              disabled={carregando}
            >
              Remover
            </Button>
          </Paper>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            startIcon={
              carregando ? (
                <CircularProgress
                  size={20}
                  color="inherit"
                />
              ) : (
                <UploadFileIcon />
              )
            }
            disabled={
              !arquivo ||
              carregando
            }
            onClick={handleImportar}
          >
            {carregando
              ? "Importando..."
              : `Importar ${configuracao.titulo}`}
          </Button>
        </Box>

        {erro && (
          <Alert
            severity="error"
            sx={{ mt: 3 }}
          >
            {erro}
          </Alert>
        )}

        {resultado && (
          <Alert
            severity="success"
            sx={{ mt: 3 }}
          >
            <Typography
              fontWeight="600"
              sx={{ mb: 1 }}
            >
              Importação concluída com sucesso.
            </Typography>

            {renderizarResultado()}
          </Alert>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <UltimasImportacoes />
        atualizacao={atualizacaoHistorico}
      </Box>
    </Box>
  );
}