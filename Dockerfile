# Gebruik een lichte en snelle versie van Node.js
FROM node:20-alpine

# Maak een werkmap aan in de container
WORKDIR /app

# Kopieer eerst de package.json bestanden (voor caching)
COPY package*.json ./

# Installeer de packages (express, nodemailer, etc.)
RUN npm install

# Kopieer de rest van je code naar de container
COPY . .

# Stel de poort bloot
EXPOSE 3000

# Start het script
CMD ["node", "server.js"]