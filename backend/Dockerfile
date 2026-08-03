# =====================================================================
# Dockerfile do backend ReEncontro
# Empacota a API Node.js/Express num container.
# =====================================================================
FROM node:22-alpine

# Pasta de trabalho dentro do container
WORKDIR /app

# Copia primeiro os arquivos de dependências (aproveita cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código
COPY . .

# A porta que o backend escuta
EXPOSE 3000

# Comando que sobe o servidor
CMD ["npm", "start"]
