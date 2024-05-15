FROM node:20

# Instala o TypeScript globalmente
RUN npm install -g typescript

# Define o diretório de trabalho
WORKDIR /basicClient

# Adiciona a pasta do aplicativo ao contêiner
COPY . /basicClient

CMD ["bash"]
