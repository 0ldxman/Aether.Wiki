FROM node:20-slim

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build --workspace=web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=web"]
