FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --only=production  # Install only production dependencies

COPY . .  

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

RUN npm run build  # Uses the correct env variables

EXPOSE 3000

CMD ["npm", "run", "start"]