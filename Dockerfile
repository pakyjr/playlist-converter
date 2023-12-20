# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the entire monorepo
COPY . .

# Install Lerna globally
RUN npm install -g lerna

# Bootstrap the packages - install all their dependencies and link any cross-dependencies
RUN lerna bootstrap

# Assuming you have a build script in your package.json that builds all packages
RUN npm run build

# Expose a port if your application needs to accept HTTP requests
EXPOSE 8080

# Run your application (adjust this command based on how you start your application)
#TODO fix the path 
CMD ["node", "packages/my-main-package/dist/index.js"] 