# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build the application
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled files from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory in case it's needed locally (though R2 might be used, this prevents errors)
RUN mkdir -p uploads && chown -R node:node uploads

# Switch to non-root user for security
USER node

# Expose port (default in the app is 5000)
EXPOSE 5000

# Health check to ensure the container is running and responsive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]
