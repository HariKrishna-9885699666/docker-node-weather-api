FROM node:20-alpine

WORKDIR /app

# Copy only dependency manifests first for better layer caching.
COPY package.json yarn.lock ./

# Use the exact Yarn version requested by the project.
RUN corepack enable && corepack prepare yarn@4.9.2 --activate

# Force node_modules linker for runtime container compatibility.
ENV YARN_NODE_LINKER=node-modules

# Install dependencies for runtime.
RUN YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn install --mode=skip-build

# Copy application source.
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
