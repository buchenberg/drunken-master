FROM node:boron

ENV wd /usr/src/app

WORKDIR ${wd}

COPY package.json package-lock.json ./


RUN npm install

COPY . .

# EXPOSE 9990

CMD [ "npm", "start" ]