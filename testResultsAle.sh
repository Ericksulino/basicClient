#!/bin/bash

# Nome do arquivo CSV
csv_file="tempos_aleatórios_exp.csv"

# Nome do arquivo de saída
output_file="testeAleExpx3371.csv"

# Extrai os tempos da coluna "Exponencial"
tempos_exponencial=($(tail -n +2 "$csv_file" | cut -d ',' -f 2))

# Cria o cabeçalho no arquivo de saída
echo "StartTime Hash EndorseTime CommitTime TotalTime" > "$output_file"

# Loop para executar o comando para cada tempo exponencial
for tempo in "${tempos_exponencial[@]}"; do
  (sudo node dist/client.js createAssetEndorse 100 B) >> "$output_file"  # Adiciona a saída ao arquivo
  sleep "$tempo"  # Aguarda o tempo especificado antes da próxima iteração
done
