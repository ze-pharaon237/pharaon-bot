FROM ze-pharaon237/pharaon-bot:latest

WORKDIR /

COPY . /pharaon-bot

WORKDIR /pharaon-bot

RUN git init --initial-branch=main

RUN git remote add origin https://github.com/Ze-pharaon237/pharaon-bot.git

RUN git fetch origin main

RUN git reset --hard origin/main

RUN yarn

# RUN cp -r /root/Baileys/lib /BotsApp/node_modules/@adiwajshing/baileys/

CMD [ "npm", "start"]
