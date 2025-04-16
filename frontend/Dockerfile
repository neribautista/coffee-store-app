FROM node:23-slim AS build

# Set the working directory inside the container
WORKDIR /frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Serve the built files using Nginx
FROM nginx:1.27-alpine-slim

# Copy the built files from the "build" stage to the Nginx web server directory
COPY --from=build /frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default Nginx port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]