# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application with SSR & SSG
RUN yarn build

# Runtime stage
FROM node:22-alpine AS runtime

WORKDIR /app

# Copy only the necessary build artifacts from the build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/yarn.lock /app/

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["yarn", "serve:ssr:solana-token-generator-frontend"]

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/ || exit 1