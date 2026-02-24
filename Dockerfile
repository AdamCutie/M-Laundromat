# --- STAGE 1: Build the Frontend (React) ---
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# --- STAGE 2: Setup the Backend (Express) ---
FROM node:18-alpine
WORKDIR /app
# Copy server dependencies first for caching
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server source code
COPY server/ ./server/

# Copy the built frontend from Stage 1
COPY --from=client-builder /app/client/dist ./client/dist

# Set working directory to server
WORKDIR /app/server

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
