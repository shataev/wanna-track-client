# Build stage
FROM node:18.16.0-alpine AS build-stage

# Define environment variables (if needed)
ARG VITE_BASE_URL
ARG VITE_VERIFICATION_CODE
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_VERIFICATION_CODE=$VITE_VERIFICATION_CODE

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM socialengine/nginx-spa:latest

# Copy the built files from the build stage
COPY --from=build-stage /app/dist /app

# Expose port for Nginx
EXPOSE 80
