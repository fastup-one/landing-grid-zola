# Landing Grid Zola Theme - Production Docker Image
# Multi-stage build for optimized final image

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install Zola
RUN apk add --no-cache wget ca-certificates \
    && wget -q -O - "https://github.com/getzola/zola/releases/download/v0.18.0/zola-v0.18.0-x86_64-unknown-linux-musl.tar.gz" | tar xzf - -C /usr/local/bin

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build Tailwind CSS (production)
RUN npm run build-css-prod

# Build Zola site
RUN zola build

# Stage 2: Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.tailwindcss.com;" always;

    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Custom 404 page
    error_page 404 /index.html;
}
EOF

# Copy built site from builder stage
COPY --from=builder /app/public /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Labels for metadata
LABEL maintainer="fastup-one"
LABEL description="Landing Grid - Modern Zola theme with glassmorphism design"
LABEL version="1.0.0"

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]