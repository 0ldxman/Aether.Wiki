FROM node:20-slim

WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY . .
RUN npm install
RUN npm run build --workspace=web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=web"]
