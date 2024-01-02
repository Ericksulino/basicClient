import subprocess
import time
import csv

# Nome do arquivo CSV
csv_file = "tempos_aleatorios_wei_dropbox.csv"

# Nome do arquivo de saída
output_file = "testeAleWei1kdb.csv"

# Lista para armazenar os tempos exponenciais
tempos_exponencial = []

# Lê os tempos do arquivo CSV
with open(csv_file, "r") as file:
    reader = csv.reader(file)
    tempos_exponencial = [float(row[0]) for row in reader if row]

# Cria o cabeçalho no arquivo de saída
with open(output_file, "w") as file:
    file.write("StartTime Hash EndorseTime CommitTime TotalTime\n")

# Loop para executar o comando para cada tempo exponencial
for tempo in tempos_exponencial:
    # Executa o comando em segundo plano e redireciona a saída para o arquivo
    subprocess.Popen(["sudo", "node", "dist/client.js", "createAssetEndorse", "1", "B"],
                     stdout=open(output_file, "a"), stderr=subprocess.STDOUT)
    
    # Aguarda o tempo especificado antes da próxima iteração
    time.sleep(tempo)  # Converte milissegundos para segundos

# Aguarda a conclusão de todos os comandos em segundo plano
time.sleep(5)  # Aguarda um tempo adicional para garantir a conclusão dos processos
