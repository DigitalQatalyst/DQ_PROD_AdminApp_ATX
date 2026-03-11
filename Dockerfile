# # syntax=docker/dockerfile:1.4

# FROM node:20-alpine AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN --mount=type=cache,target=/root/.npm npm ci

# COPY . .
# RUN npm run build

# FROM node:20-alpine AS runner
# WORKDIR /app

# # Install 'serve' globally to serve static files
# RUN npm install -g serve

# # Copy only the built files
# COPY --from=builder /app/dist ./dist

# EXPOSE 3000
# CMD ["serve", "-s", "dist", "-l", "3000", "tcp://0.0.0.0:3000"]

# Build stage
FROM node:18-alpine AS builder
 
WORKDIR /app
 
# Copy package files
COPY package*.json ./
 
# Install dependencies
RUN npm ci
 
# Copy source code
COPY . .
 
# Build the app
RUN npm run build
 
# Production stage
FROM nginx:alpine
 
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
 
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
 
# Expose port 3000 (to match your K8s config)
EXPOSE 3000
 
CMD ["nginx", "-g", "daemon off;"]
