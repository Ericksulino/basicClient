# basicClient

Este repositório contém o software **basicClient**, que é uma ferramenta para interagir com uma blockchain. Antes de começar, certifique-se de seguir as instruções abaixo para configurar corretamente o ambiente.

## Pré-requisitos

Para utilizar o **basicClient**, é necessário ter o Node.js e o TypeScript instalados em seu ambiente.

### Instalando o Node.js com NVM (Node Version Manager)

O NVM é uma maneira conveniente de gerenciar as versões do Node.js. Siga os passos abaixo para instalá-lo:

1. Instale o wget, se ainda não estiver instalado:
   
   sudo apt install wget

2. Baixe e execute o script de instalação do NVM:

    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

3. Carregue o NVM em seu perfil de usuário:

    source ~/.profile

4. Liste as versões do Node.js disponíveis para instalação:

    nvm ls-remote
5. Escolha a versão desejada (recomendamos a versão 18.17.1) e instale:

    nvm install 18.17.1

6. Verifique se a instalação foi bem-sucedida:

    node -v

### Instalando o TypeScript
Para instalar o TypeScript globalmente, execute o seguinte comando:

    npm install -g typescript

### Instalando e usando o basicClient
Siga as etapas abaixo para clonar o repositório e configurar o basicClient:

1. Clone este repositório dentro da pasta fabric-samples/test-network:

    git clone https://github.com/Ericksulino/basicClient.git

2. Navegue até a pasta do projeto:

    cd basicClient

3. Instale as dependências do projeto:

    npm install

4. Execute o processo de build:

    npm run build

Agora você está pronto para utilizar o basicClient. Execute o seguinte comando para iniciar a ferramenta com argumentos específicos:

Para povoar a blockchain com assets pré-definidos:

    npm start initLedger

Para criar novos assets:

    npm start createAsset [n]

Para criar novos assets com operações de Endorse/Submit/CommitStatus:

    npm start createAssetEndorse [n]

Para visualizar todos os assets:

    npm start getAll

Para visualizar um asset pelo seu ID:

    npm start getByKey [id]

Para transferir a propriedade de um asset:

    npm start transferAsset [id] [newOwner]

Para atualizar um asset existente:

    npm start updateAsset [id]

# Lembre-se de substituir `[n]`, `[id]` e `[newOwner]` pelos valores apropriados.

Aproveite o uso do **basicClient**! Se tiver alguma dúvida ou problema, não hesite em entrar em contato.


