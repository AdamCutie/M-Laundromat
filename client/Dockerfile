# --- STAGE 1: Build the React App ---
FROM node:18-alpine as builder

WORKDIR /app

# Copy dependencies first
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the static files (creates /app/dist)
RUN npm run build

# --- STAGE 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the built files from Stage 1 to Nginx folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Standard Web Port)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]