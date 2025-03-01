# ---- Stage 1: Builder ----
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies separately for better caching
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy project files
COPY . .

# Build the Next.js app
RUN npm run build

# ---- Stage 2: Development Environment ----
FROM node:18-alpine AS dev
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only development dependencies
RUN npm ci --frozen-lockfile --only=development

# Copy source code for development (not built files)
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]

# ---- Stage 3: Production Environment ----
FROM node:18-alpine AS production
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --frozen-lockfile --only=production

# Copy only necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]