# Use minimal Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the full project
COPY . .

# Build the TypeScript project
RUN yarn build

# Expose the app port
EXPOSE 3000

# Start the compiled app
CMD ["node", "dist/index.js"]
