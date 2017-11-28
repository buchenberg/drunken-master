FROM node:8

ENV wd /usr/src/app

WORKDIR ${wd}

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]