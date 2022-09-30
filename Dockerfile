FROM node:lts-buster

RUN apt-get update

RUN npm install

RUN rm -rf node_modules

RUN rm -rf session.data.json

RUN rm -rf BotsApp.db

CMD ["npm", "start"]
