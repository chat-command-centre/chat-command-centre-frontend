# Use the official Bun image
FROM oven/bun:latest

WORKDIR /app

# Copy package.json and bun.lockb to install dependencies
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the frontend code
COPY . .

# Build the frontend application
RUN bun run build

# Expose port
EXPOSE 3000

# Start the Next.js application
CMD ["bun", "run", "start"]