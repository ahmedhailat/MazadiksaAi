# Use official Node 18 image
FROM node:18.16.0-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Start the app
CMD ["npm", "start"]
