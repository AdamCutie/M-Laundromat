# 1. Use Node.js base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy ALL code (Client and Server)
COPY . .

# --- BUILD FRONTEND ---
WORKDIR /app/client
# Install client dependencies
RUN npm install
# Build the React app (creates /app/client/dist)
RUN npm run build

# --- SETUP BACKEND ---
WORKDIR /app/server
# Install server dependencies
RUN npm install --production

# 4. Expose the port (Render usually uses 10000 or the PORT env var)
EXPOSE 5000

# 5. Start the Server
CMD ["node", "server.js"]