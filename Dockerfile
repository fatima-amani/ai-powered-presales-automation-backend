# Use official Node.js image
FROM node:18

# Set working directory to match your folder name
WORKDIR /backend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project (excluding files in .dockerignore if you create one)
COPY . .

# Expose port (adjust if needed)
EXPOSE 8080

# Start app
CMD ["node", "server.js"]
