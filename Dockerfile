FROM node:latest

RUN mkdir -p /app
RUN mkdir -p /app/config
WORKDIR /app

RUN npm install
RUN npm install discord.js
RUN npm install dotenv
RUN npm install discord-buttons
RUN npm install ascii-table
RUN npm install random-puppy

COPY . /app/

VOLUME [ "/app/config" ]

CMD ["node", "index.js"]