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

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (mapped to 3000 externally)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
