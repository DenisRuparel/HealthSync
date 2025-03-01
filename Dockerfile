FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Pass environment variables at build time
ARG NEXT_PUBLIC_DATABASE_ID
ARG NEXT_PUBLIC_PATIENTS_COLLECTION_ID
ARG NEXT_PUBLIC_DOCTORS_COLLECTION_ID
ARG NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID
ARG NEXT_PUBLIC_BUCKET_ID
ARG NEXT_PUBLIC_ENDPOINT
ARG NEXT_PUBLIC_ADMIN_PASSKEY

# Make them available to Next.js
ENV NEXT_PUBLIC_DATABASE_ID=$NEXT_PUBLIC_DATABASE_ID
ENV NEXT_PUBLIC_PATIENTS_COLLECTION_ID=$NEXT_PUBLIC_PATIENTS_COLLECTION_ID
ENV NEXT_PUBLIC_DOCTORS_COLLECTION_ID=$NEXT_PUBLIC_DOCTORS_COLLECTION_ID
ENV NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID=$NEXT_PUBLIC_APPOINTMENT_COLLECTION_ID
ENV NEXT_PUBLIC_BUCKET_ID=$NEXT_PUBLIC_BUCKET_ID
ENV NEXT_PUBLIC_ENDPOINT=$NEXT_PUBLIC_ENDPOINT
ENV NEXT_PUBLIC_ADMIN_PASSKEY=$NEXT_PUBLIC_ADMIN_PASSKEY

RUN npm run build

# Remove development dependencies (if using npm prune)
RUN npm prune --production

# Use a lightweight production-ready image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the built application and dependencies from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production

# Expose the port Next.js runs on
EXPOSE 3000

CMD ["npm", "run", "dev"]