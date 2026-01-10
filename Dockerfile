# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Runtime Stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Set NODE_ENV to production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the application
CMD ["node", "./dist/server/entry.mjs"]
