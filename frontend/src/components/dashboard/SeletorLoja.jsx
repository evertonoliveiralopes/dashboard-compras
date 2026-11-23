import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { buscarLojas } from "../../services/lojaService";

export default function SeletorLoja({ lojaSelecionada, onChange, lateral = false, compacto = false }) {
  const [lojas, setLojas] = useState(null);

  useEffect(() => {
    let ativo = true;
    let requisicao = 0;
    async function carregarLojas() {
      const atual = ++requisicao;
      try {
        const dados = await buscarLojas();
        if (ativo && atual === requisicao) setLojas(dados);
      } catch (erro) {
        if (ativo && atual === requisicao) setLojas((anteriores) => anteriores ?? []);
        console.error("Erro ao carregar lojas:", erro);
      }
    }

    carregarLojas();
    window.addEventListener("lojasCadastradasAlteradas", carregarLojas);
    return () => {
      ativo = false;
      window.removeEventListener("lojasCadastradasAlteradas", carregarLojas);
    };
  }, []);

  const atual = lojas?.find((loja) => loja.id === lojaSelecionada?.id);
  const exibida = lojas ? atual : lojaSelecionada;

  return (
    <FormControl size="small" fullWidth={lateral} sx={{ minWidth: lateral ? 0 : 240 }}>
      {!lateral && <InputLabel id="seletor-loja-label">Loja</InputLabel>}

      <Select
        labelId={lateral ? undefined : "seletor-loja-label"}
        value={atual?.id ?? ""}
        label={lateral ? undefined : "Loja"}
        displayEmpty={lateral}
        className={lateral ? "compra-sidebar-controle compra-sidebar-loja" : undefined}
        SelectDisplayProps={lateral ? { "aria-label": "Loja", title: [exibida?.nome, exibida?.unidade].filter(Boolean).join(" — ") || "Selecionar loja" } : undefined}
        renderValue={lateral ? () => (
          <>
            <Box className="compra-sidebar-loja-icone"><StorefrontOutlinedIcon fontSize="small" /></Box>
            {!compacto && (
              <Box className="compra-sidebar-identidade">
                <Typography component="span" className="compra-sidebar-identidade-nome" noWrap>
                  {exibida?.nome || "Selecionar loja"}
                </Typography>
                <Typography component="span" className="compra-sidebar-identidade-detalhe" noWrap>
                  {exibida?.unidade || "Loja"}
                </Typography>
              </Box>
            )}
          </>
        ) : undefined}
        MenuProps={lateral ? {
          anchorOrigin: { vertical: "top", horizontal: "left" },
          transformOrigin: { vertical: "bottom", horizontal: "left" },
          slotProps: { paper: { sx: { width: 304, maxWidth: "calc(100vw - 32px)", mb: 0.75 } } },
        } : undefined}
        onChange={(evento) => {
          const loja = lojas?.find((item) => String(item.id) === String(evento.target.value));
          if (loja) onChange(loja);
        }}
      >
        {lojas?.map((loja) => (
          <MenuItem key={loja.id} value={loja.id} sx={lateral ? { whiteSpace: "normal" } : undefined}>
            {lateral ? (
              <Box>
                <Typography variant="body2" fontWeight={600}>{loja.nome}</Typography>
                {loja.unidade && <Typography variant="caption" color="text.secondary">{loja.unidade}</Typography>}
              </Box>
            ) : `${loja.nome} - ${loja.unidade}`}
          </MenuItem>
        ))}
        {lateral && !lojas?.length && (
          <MenuItem disabled value="">{lojas ? "Nenhuma loja disponível" : "Carregando lojas…"}</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}
