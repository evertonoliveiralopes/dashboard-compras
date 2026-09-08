import { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

import { buscarLojas } from "../../services/lojaService";

export default function SeletorLoja({ lojaSelecionada, onChange }) {
  const [lojas, setLojas] = useState([]);

  useEffect(() => {
    async function carregarLojas() {
      try {
        const dados = await buscarLojas();
        setLojas(dados);
      } catch (erro) {
        console.error("Erro ao carregar lojas:", erro);
      }
    }

    carregarLojas();
  }, []);

  return (
    <FormControl size="small" sx={{ minWidth: 240 }}>
      <InputLabel>Loja</InputLabel>

      <Select
        value={lojaSelecionada?.id || ""}
        label="Loja"
        onChange={(evento) => {
          const loja = lojas.find(
            (item) => item.id === Number(evento.target.value)
          );

          if (loja) {
            onChange(loja);
          }
        }}
      >
        {lojas.map((loja) => (
          <MenuItem key={loja.id} value={loja.id}>
            {loja.nome} — {loja.unidade}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
