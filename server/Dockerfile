# 1. Use an official Node.js runtime as a parent image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy the rest of the backend code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 5000

# 7. Define the command to run your app
CMD ["node", "server.js"]