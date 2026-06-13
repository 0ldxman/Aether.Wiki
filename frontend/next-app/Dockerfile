FROM node:20-slim

WORKDIR /app

ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=$BACKEND_URL

COPY . .
RUN npm install
RUN npm run build --workspace=web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=web"]
