import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";

import {
  importarProdutos,
  importarDepartamentos,
  importarFornecedores,
  importarEntradas,
  importarVendas,
} from "../../services/importacaoService";

export default function Importacoes() {
  const lojaSelecionada = JSON.parse(
    localStorage.getItem("lojaSelecionada")
  );

  const [arquivoProdutos, setArquivoProdutos] = useState(null);
  const [arquivoDepartamentos, setArquivoDepartamentos] = useState(null);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [carregandoDepartamentos, setCarregandoDepartamentos] = useState(false);
  const [resultadoProdutos, setResultadoProdutos] = useState(null);
  const [resultadoDepartamentos, setResultadoDepartamentos] = useState(null);
  const [erroProdutos, setErroProdutos] = useState("");
  const [erroDepartamentos, setErroDepartamentos] = useState("");
  const [arquivoFornecedores, setArquivoFornecedores] = useState(null);
  const [carregandoFornecedores, setCarregandoFornecedores] = useState(false);
  const [resultadoFornecedores, setResultadoFornecedores] = useState(null);
  const [erroFornecedores, setErroFornecedores] = useState("");
  const [arquivoEntradas, setArquivoEntradas] = useState(null);
  const [carregandoEntradas, setCarregandoEntradas] = useState(false);
  const [resultadoEntradas, setResultadoEntradas] = useState(null);
  const [erroEntradas, setErroEntradas] = useState("");
  const [arquivoVendas, setArquivoVendas] = useState(null);
  const [carregandoVendas, setCarregandoVendas] = useState(false);
  const [resultadoVendas, setResultadoVendas] = useState(null);
  const [erroVendas, setErroVendas] = useState("");

  function selecionarProdutos(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
      return;
    }

    setArquivoProdutos(arquivo);
    setResultadoProdutos(null);
    setErroProdutos("");
  }

  function selecionarDepartamentos(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
      return;
    }

    setArquivoDepartamentos(arquivo);
    setResultadoDepartamentos(null);
    setErroDepartamentos("");
  }

  function selecionarFornecedores(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
        return;
    }

    setArquivoFornecedores(arquivo);
    setResultadoFornecedores(null);
    setErroFornecedores("");
  }

  function selecionarEntradas(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
        return;
    }

    setArquivoEntradas(arquivo);
    setResultadoEntradas(null);
    setErroEntradas("");
  }

  function selecionarVendas(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) {
        return;
    }

    setArquivoVendas(arquivo);
    setResultadoVendas(null);
    setErroVendas("");
  }

  function removerProdutos() {
    setArquivoProdutos(null);
    setResultadoProdutos(null);
    setErroProdutos("");
  }

  function removerDepartamentos() {
    setArquivoDepartamentos(null);
    setResultadoDepartamentos(null);
    setErroDepartamentos("");
  }
  function removerFornecedores() {
    setArquivoFornecedores(null);
    setResultadoFornecedores(null);
    setErroFornecedores("");
  }
  function removerEntradas() {
    setArquivoEntradas(null);
    setResultadoEntradas(null);
    setErroEntradas("");
  }
  function removerVendas() {
    setArquivoVendas(null);
    setResultadoVendas(null);
    setErroVendas("");
  }

  async function handleImportarProdutos() {
    if (!arquivoProdutos) {
      setErroProdutos("Selecione um arquivo para importar.");
      return;
    }

    try {
      setCarregandoProdutos(true);
      setErroProdutos("");
      setResultadoProdutos(null);

      const dados = await importarProdutos(arquivoProdutos);

      setResultadoProdutos(dados);
      setArquivoProdutos(null);
    } catch (error) {
      console.error("Erro ao importar produtos:", error);

      setErroProdutos(
        error.response?.data?.detail ||
          "Não foi possível realizar a importação."
      );
    } finally {
      setCarregandoProdutos(false);
    }
  }

  async function handleImportarDepartamentos() {
    if (!arquivoDepartamentos) {
      setErroDepartamentos("Selecione um arquivo para importar.");
      return;
    }

    try {
      setCarregandoDepartamentos(true);
      setErroDepartamentos("");
      setResultadoDepartamentos(null);

      const dados = await importarDepartamentos(
        arquivoDepartamentos
      );

      setResultadoDepartamentos(dados);
      setArquivoDepartamentos(null);
    } catch (error) {
      console.error(
        "Erro ao importar departamentos:",
        error
      );

      setErroDepartamentos(
        error.response?.data?.detail ||
          "Não foi possível realizar a importação."
      );
    } finally {
      setCarregandoDepartamentos(false);
    }
  }

  async function handleImportarFornecedores() {
    if (!arquivoFornecedores) {
        setErroFornecedores(
        "Selecione um arquivo para importar."
        );
        return;
    }

    try {
        setCarregandoFornecedores(true);
        setErroFornecedores("");
        setResultadoFornecedores(null);

        const dados = await importarFornecedores(
        arquivoFornecedores
        );

        setResultadoFornecedores(dados);
        setArquivoFornecedores(null);

    } catch (error) {
        console.error(
        "Erro ao importar fornecedores:",
        error
        );

        setErroFornecedores(
        error.response?.data?.detail ||
            "Não foi possível realizar a importação."
        );

    } finally {
        setCarregandoFornecedores(false);
    }
  }

  async function handleImportarEntradas() {
    if (!arquivoEntradas) {
        setErroEntradas(
        "Selecione um arquivo para importar."
        );
        return;
    }

    try {
        setCarregandoEntradas(true);
        setErroEntradas("");
        setResultadoEntradas(null);

        const dados = await importarEntradas(
        arquivoEntradas,
        lojaSelecionada.id
        );

        setResultadoEntradas(dados);
        setArquivoEntradas(null);

    } catch (error) {
        console.error(
        "Erro ao importar entradas:",
        error
        );

        setErroEntradas(
        error.response?.data?.detail ||
            "Não foi possível realizar a importação."
        );

    } finally {
        setCarregandoEntradas(false);
    }
  }
  async function handleImportarVendas() {
    if (!arquivoVendas) {
        setErroVendas(
        "Selecione um arquivo para importar."
        );
        return;
    }

    try {
        setCarregandoVendas(true);
        setErroVendas("");
        setResultadoVendas(null);

        const dados = await importarVendas(
        arquivoVendas,
        lojaSelecionada.id
        );

        setResultadoVendas(dados);
        setArquivoVendas(null);

    } catch (error) {
        console.error(
        "Erro ao importar vendas:",
        error
        );

        setErroVendas(
        error.response?.data?.detail ||
            "Não foi possível realizar a importação."
        );

    } finally {
        setCarregandoVendas(false);
    }
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 3,
        }}
      >

        {/* PRODUTOS */}

        <Paper
          elevation={2}
          sx={{ p: 3 }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
          >
            Produtos
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1, mb: 3 }}
          >
            Importe os produtos exportados pelo sistema Arius.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
            }}
          >
            <UploadFileIcon
              sx={{
                fontSize: 42,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography sx={{ mb: 2 }}>
              Selecione o arquivo de produtos
            </Typography>

            <Button
              variant="outlined"
              component="label"
            >
              Selecionar arquivo

              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={selecionarProdutos}
              />
            </Button>
          </Box>

          {arquivoProdutos && (
            <Paper
              variant="outlined"
              sx={{
                mt: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography fontWeight="600">
                  Arquivo selecionado
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {arquivoProdutos.name}
                </Typography>
              </Box>

              <Button
                color="error"
                startIcon={<CloseIcon />}
                onClick={removerProdutos}
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
                carregandoProdutos ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <UploadFileIcon />
                )
              }
              disabled={
                !arquivoProdutos ||
                carregandoProdutos
              }
              onClick={handleImportarProdutos}
            >
              {carregandoProdutos
                ? "Importando..."
                : "Importar Produtos"}
            </Button>
          </Box>

          {erroProdutos && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
            >
              {erroProdutos}
            </Alert>
          )}

          {resultadoProdutos && (
            <Alert
              severity="success"
              sx={{ mt: 3 }}
            >
              Importação concluída com sucesso.

              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Inseridos:{" "}
                  {resultadoProdutos.inseridos ?? 0}
                </Typography>

                <Typography variant="body2">
                  Atualizados:{" "}
                  {resultadoProdutos.atualizados ?? 0}
                </Typography>
              </Box>
            </Alert>
          )}
        </Paper>

        {/* DEPARTAMENTOS */}

        <Paper
          elevation={2}
          sx={{ p: 3 }}
        >
          <Typography
            variant="h6"
            fontWeight="600"
          >
            Departamentos
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1, mb: 3 }}
          >
            Importe os departamentos exportados pelo sistema Arius.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
            }}
          >
            <UploadFileIcon
              sx={{
                fontSize: 42,
                color: "text.secondary",
                mb: 1,
              }}
            />

            <Typography sx={{ mb: 2 }}>
              Selecione o arquivo de departamentos
            </Typography>

            <Button
              variant="outlined"
              component="label"
            >
              Selecionar arquivo

              <input
                type="file"
                hidden
                accept=".csv,.xlsx,.xls"
                onChange={selecionarDepartamentos}
              />
            </Button>
          </Box>

          {arquivoDepartamentos && (
            <Paper
              variant="outlined"
              sx={{
                mt: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography fontWeight="600">
                  Arquivo selecionado
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {arquivoDepartamentos.name}
                </Typography>
              </Box>

              <Button
                color="error"
                startIcon={<CloseIcon />}
                onClick={removerDepartamentos}
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
                carregandoDepartamentos ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <UploadFileIcon />
                )
              }
              disabled={
                !arquivoDepartamentos ||
                carregandoDepartamentos
              }
              onClick={handleImportarDepartamentos}
            >
              {carregandoDepartamentos
                ? "Importando..."
                : "Importar Departamentos"}
            </Button>
          </Box>

          {erroDepartamentos && (
            <Alert
              severity="error"
              sx={{ mt: 3 }}
            >
              {erroDepartamentos}
            </Alert>
          )}

          {resultadoDepartamentos && (
            <Alert
              severity="success"
              sx={{ mt: 3 }}
            >
              Importação concluída com sucesso.

              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Inseridos:{" "}
                  {resultadoDepartamentos.inseridos ?? 0}
                </Typography>

                <Typography variant="body2">
                  Atualizados:{" "}
                  {resultadoDepartamentos.atualizados ?? 0}
                </Typography>
              </Box>
            </Alert>
          )}
        </Paper>

        <Paper
            elevation={2}
            sx={{ p: 3 }}
            >
            <Typography
                variant="h6"
                fontWeight="600"
            >
                Fornecedores
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mt: 1, mb: 3 }}
            >
                Importe os fornecedores exportados pelo sistema Arius.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box
                sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                }}
            >
                <UploadFileIcon
                sx={{
                    fontSize: 42,
                    color: "text.secondary",
                    mb: 1,
                }}
                />

                <Typography sx={{ mb: 2 }}>
                Selecione o arquivo de fornecedores
                </Typography>

                <Button
                variant="outlined"
                component="label"
                >
                Selecionar arquivo

                <input
                    type="file"
                    hidden
                    accept=".csv,.xlsx,.xls"
                    onChange={selecionarFornecedores}
                />
                </Button>
            </Box>

            {arquivoFornecedores && (
                <Paper
                variant="outlined"
                sx={{
                    mt: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                >
                <Box>
                    <Typography fontWeight="600">
                    Arquivo selecionado
                    </Typography>

                    <Typography
                    variant="body2"
                    color="text.secondary"
                    >
                    {arquivoFornecedores.name}
                    </Typography>
                </Box>

                <Button
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={removerFornecedores}
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
                    carregandoFornecedores ? (
                    <CircularProgress
                        size={20}
                        color="inherit"
                    />
                    ) : (
                    <UploadFileIcon />
                    )
                }
                disabled={
                    !arquivoFornecedores ||
                    carregandoFornecedores
                }
                onClick={handleImportarFornecedores}
                >
                {carregandoFornecedores
                    ? "Importando..."
                    : "Importar Fornecedores"}
                </Button>
            </Box>

            {erroFornecedores && (
                <Alert
                severity="error"
                sx={{ mt: 3 }}
                >
                {erroFornecedores}
                </Alert>
            )}

            {resultadoFornecedores && (
                <Alert
                severity="success"
                sx={{ mt: 3 }}
                >
                Importação concluída com sucesso.

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                    Inseridos:{" "}
                    {resultadoFornecedores.inseridos ?? 0}
                    </Typography>

                    <Typography variant="body2">
                    Atualizados:{" "}
                    {resultadoFornecedores.atualizados ?? 0}
                    </Typography>
                </Box>
                </Alert>
            )}
        </Paper>

        <Paper
            elevation={2}
            sx={{ p: 3 }}
            >
            <Typography
                variant="h6"
                fontWeight="600"
            >
                Entradas
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mt: 1, mb: 3 }}
            >
                Importe as entradas de mercadorias exportadas pelo sistema Arius.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box
                sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                }}
            >
                <UploadFileIcon
                sx={{
                    fontSize: 42,
                    color: "text.secondary",
                    mb: 1,
                }}
                />

                <Typography sx={{ mb: 2 }}>
                Selecione o arquivo de entradas
                </Typography>

                <Button
                variant="outlined"
                component="label"
                >
                Selecionar arquivo

                <input
                    type="file"
                    hidden
                    accept=".csv,.xlsx,.xls"
                    onChange={selecionarEntradas}
                />
                </Button>
            </Box>

            {arquivoEntradas && (
                <Paper
                variant="outlined"
                sx={{
                    mt: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                >
                <Box>
                    <Typography fontWeight="600">
                    Arquivo selecionado
                    </Typography>

                    <Typography
                    variant="body2"
                    color="text.secondary"
                    >
                    {arquivoEntradas.name}
                    </Typography>
                </Box>

                <Button
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={removerEntradas}
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
                    carregandoEntradas ? (
                    <CircularProgress
                        size={20}
                        color="inherit"
                    />
                    ) : (
                    <UploadFileIcon />
                    )
                }
                disabled={
                    !arquivoEntradas ||
                    carregandoEntradas
                }
                onClick={handleImportarEntradas}
                >
                {carregandoEntradas
                    ? "Importando..."
                    : "Importar Entradas"}
                </Button>
            </Box>

            {erroEntradas && (
                <Alert
                severity="error"
                sx={{ mt: 3 }}
                >
                {erroEntradas}
                </Alert>
            )}

            {resultadoEntradas && (
                <Alert
                severity="success"
                sx={{ mt: 3 }}
                >
                Importação concluída com sucesso.

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        Entradas criadas:{" "}
                        {resultadoEntradas.entradas_criadas ?? 0}
                    </Typography>

                    <Typography variant="body2">
                        Itens criados:{" "}
                        {resultadoEntradas.itens_criados ?? 0}
                    </Typography>

                    <Typography variant="body2">
                        Fornecedores encontrados:{" "}
                        {resultadoEntradas.fornecedores_encontrados ?? 0}
                    </Typography>

                    <Typography variant="body2">
                        Fornecedores não encontrados:{" "}
                        {resultadoEntradas.fornecedores_nao_encontrados ?? 0}
                    </Typography>

                    <Typography variant="body2">
                        Produtos encontrados:{" "}
                        {resultadoEntradas.produtos_encontrados ?? 0}
                    </Typography>

                    <Typography variant="body2">
                        Produtos não encontrados:{" "}
                        {resultadoEntradas.produtos_nao_encontrados ?? 0}
                    </Typography>
                </Box>
                </Alert>
            )}
        </Paper>
        <Paper
            elevation={2}
            sx={{ p: 3 }}
            >
            <Typography
                variant="h6"
                fontWeight="600"
            >
                Vendas
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mt: 1, mb: 3 }}
            >
                Importe as vendas exportadas pelo sistema Arius.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Box
                sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                }}
            >
                <UploadFileIcon
                sx={{
                    fontSize: 42,
                    color: "text.secondary",
                    mb: 1,
                }}
                />

                <Typography sx={{ mb: 2 }}>
                Selecione o arquivo de vendas
                </Typography>

                <Button
                variant="outlined"
                component="label"
                >
                Selecionar arquivo

                <input
                    type="file"
                    hidden
                    accept=".csv,.xlsx,.xls"
                    onChange={selecionarVendas}
                />
                </Button>
            </Box>

            {arquivoVendas && (
                <Paper
                variant="outlined"
                sx={{
                    mt: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
                >
                <Box>
                    <Typography fontWeight="600">
                    Arquivo selecionado
                    </Typography>

                    <Typography
                    variant="body2"
                    color="text.secondary"
                    >
                    {arquivoVendas.name}
                    </Typography>
                </Box>

                <Button
                    color="error"
                    startIcon={<CloseIcon />}
                    onClick={removerVendas}
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
                    carregandoVendas ? (
                    <CircularProgress
                        size={20}
                        color="inherit"
                    />
                    ) : (
                    <UploadFileIcon />
                    )
                }
                disabled={
                    !arquivoVendas ||
                    carregandoVendas
                }
                onClick={handleImportarVendas}
                >
                {carregandoVendas
                    ? "Importando..."
                    : "Importar Vendas"}
                </Button>
            </Box>

            {erroVendas && (
                <Alert
                severity="error"
                sx={{ mt: 3 }}
                >
                {erroVendas}
                </Alert>
            )}

            {resultadoVendas && (
                <Alert
                severity="success"
                sx={{ mt: 3 }}
                >
                Importação concluída com sucesso.

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                    Registros importados:{" "}
                    {resultadoVendas.registros_importados ?? 0}
                    </Typography>
                </Box>
                </Alert>
            )}
        </Paper>

      </Box>
    </Box>
  );
}