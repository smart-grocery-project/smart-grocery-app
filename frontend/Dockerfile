FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8081

CMD ["npx", "expo", "start", "--web", "--port", "8081", "--clear"]
