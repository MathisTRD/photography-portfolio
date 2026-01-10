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
FROM nginx:alpine

# Copy built static files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration for SPA routing
RUN echo 'server { \
    listen 3000; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Disable caching for HTML files \
    location ~* \.html$ { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
    \
    # Cache static assets \
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        add_header Cache-Control "public, max-age=31536000, immutable"; \
    } \
    \
    # Handle all requests - try file, then directory with index, then fallback to index.html \
    location / { \
        try_files $uri $uri.html $uri/ $uri/index.html /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
