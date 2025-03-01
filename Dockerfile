FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG APPWRITE_ENDPOINT
ARG APPWRITE_PROJECT_ID
ARG APPWRITE_API_KEY
ARG APPWRITE_DATABASE_ID
ENV APPWRITE_ENDPOINT=$APPWRITE_ENDPOINT
ENV APPWRITE_PROJECT_ID=$APPWRITE_PROJECT_ID
ENV APPWRITE_API_KEY=$APPWRITE_API_KEY
ENV APPWRITE_DATABASE_ID=$APPWRITE_DATABASE_ID

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]