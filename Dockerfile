FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm install pm2 -g
EXPOSE 3000
CMD ["pm2-runtime", "app.js"]