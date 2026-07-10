# Stage 1: Build the Angular app
FROM node:20.23.1-alpine3.19 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy your source code
COPY . .

# Build for production
RUN npm run build --prod

# Stage 2: Serve the app with Nginx
FROM nginx:1.26.15-alpine3.19
# IMPORTANT: Replace 'lumina' with the exact folder name inside your 'dist/'
# folder created after running 'npm run build'
COPY --from=build /app/dist/lms-ui /usr/share/nginx/html

# Copy the Nginx config to handle routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
