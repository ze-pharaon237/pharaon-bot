FROM node:lts-buster

WORKDIR /usr/app

COPY ./ ./

RUN apt update

RUN apt -y install ffmpeg

RUN npm install -g typescript

RUN npm install

RUN rm -rf session.data.json

RUN rm -rf BotsApp.db

CMD ["npm", "start"]
