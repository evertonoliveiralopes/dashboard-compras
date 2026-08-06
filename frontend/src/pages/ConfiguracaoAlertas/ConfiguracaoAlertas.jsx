import {
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControlLabel,
  Switch,
  Checkbox,
  TextField,
  Button,
  Divider,
  Box,
} from "@mui/material";

import { useState } from "react";


export default function ConfiguracaoAlertas() {

  const departamentos = [
    "Bebidas",
    "Mercearia",
    "Perecíveis",
    "Açougue",
    "Hortifruti",
    "Limpeza",
    "Higiene",
  ];


  const [departamentosSelecionados, setDepartamentosSelecionados] =
    useState([
      "Bebidas",
      "Mercearia",
    ]);


  function selecionarDepartamento(departamento) {

    if (departamentosSelecionados.includes(departamento)) {

      setDepartamentosSelecionados(
        departamentosSelecionados.filter(
          (item) => item !== departamento
        )
      );

    } else {

      setDepartamentosSelecionados([
        ...departamentosSelecionados,
        departamento,
      ]);

    }
  }


  return (

    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >

      <Typography
        variant="h5"
        fontWeight="bold"
      >
        Configuração de Alertas
      </Typography>


      <Typography
        color="text.secondary"
        sx={{ mt: 1, mb: 3 }}
      >
        Defina quais indicadores o Compra360 deve monitorar.
      </Typography>



      <Grid container spacing={3}>


        {/* TIPOS DE ALERTA */}

        <Grid item xs={12} md={15}>

          <Card>

            <CardContent>

              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Tipos de Alertas
              </Typography>


              <Divider sx={{ my: 2 }} />


              

                <FormControlLabel
                  control={<Switch  />}
                  label="Alteração de preço de compra"
                />


                <TextField
                  size="small"
                  label="Variação mínima (%)"
                  defaultValue="10"
                  sx={{
                    mt: 2,
                    width: "200px",
                  }}
                />


              <Divider sx={{ my: 3 }} />



              <FormControlLabel
                control={<Switch />}
                label="Estoque abaixo do mínimo"
              />



              <TextField
                size="small"
                label="Quantidade mínima"
                defaultValue="20"
                sx={{
                  mt: 2,
                  width: "200px",
                }}
              />



              <Divider sx={{ my: 3 }} />



              <FormControlLabel
                control={<Switch />}
                label="Produto sem movimentação"
              />


              <TextField
                size="small"
                label="Dias sem venda"
                defaultValue="30"
                sx={{
                  mt: 2,
                  width: "200px",
                }}
              />


            </CardContent>

          </Card>

        </Grid>





        {/* DEPARTAMENTOS */}

        <Grid item xs={12} md={4}>


          <Card>


            <CardContent>


              <Typography
                variant="h6"
                fontWeight="bold"
              >
                Departamentos Monitorados
              </Typography>


              <Typography
                color="text.secondary"
                variant="body2"
                sx={{ mt: 1 }}
              >
                Escolha onde os alertas serão aplicados.
              </Typography>


              <Divider sx={{ my: 2 }} />



              <Grid container>


                {departamentos.map((departamento) => (

                  <Grid
                    item
                    xs={6}
                    key={departamento}
                  >

                    <FormControlLabel

                      control={
                        <Checkbox
                          checked={
                            departamentosSelecionados.includes(
                              departamento
                            )
                          }

                          onChange={() =>
                            selecionarDepartamento(
                              departamento
                            )
                          }
                        />
                      }

                      label={departamento}

                    />

                  </Grid>

                ))}


              </Grid>


            </CardContent>


          </Card>


        </Grid>


      </Grid>




      <Button
        variant="contained"
        sx={{
          mt: 3,
        }}
      >
        Salvar Configurações
      </Button>



    </Paper>

  );
}