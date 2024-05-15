FROM node:20

# Instala o TypeScript globalmente
RUN npm install -g typescript

# Define o diretório de trabalho
WORKDIR /basicClient

# Adiciona a pasta do aplicativo ao contêiner
COPY . /basicClient

# Compila o código TypeScript para JavaScript
RUN tsc

# Define o comando para manter o contêiner em execução
CMD ["tail", "-f", "/dev/null"]
