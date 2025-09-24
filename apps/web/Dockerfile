# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vendor/ ./vendor/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variable for API URL during build
ARG VITE_CANON_API=http://localhost:3000
ENV VITE_CANON_API=$VITE_CANON_API

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
