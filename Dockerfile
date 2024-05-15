FROM ubuntu:latest

# Atualiza a lista de pacotes e instala o Node.js
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install -g n && \
    n latest

# Define o diretório de trabalho
WORKDIR /basicClient

# Adiciona a pasta do aplicativo ao contêiner
COPY ./basicClient /basicClient

CMD ["bash"]
