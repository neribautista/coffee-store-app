FROM node:23

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Expose the backend port
EXPOSE 3001

# Start the backend server
CMD ["npm", "run", "dev"]