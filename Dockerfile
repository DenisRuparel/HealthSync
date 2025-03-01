# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files first to leverage caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
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

# Build the Next.js application
RUN npm run build

# Remove development dependencies (optional)
RUN npm prune --production

# Use a lightweight production-ready image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]