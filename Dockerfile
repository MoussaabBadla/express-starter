FROM node:20-alpine

COPY package*.json ./
RUN npm ci 
USER node

WORKDIR /home/node/

COPY . .

RUN npm run build 
EXPOSE 8000

CMD [ "npm", "start" ]