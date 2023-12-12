FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

# RUN \
#     if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
#     elif [ -f package-lock.json ]; then npm ci; \
#     elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
#     # Allow install without lockfile, so example works even without Node.js installed locally
#     else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
#     fi

COPY . .

# COPY src ./src
# COPY public ./public
# COPY next.config.js .
# COPY tsconfig.json .
# COPY tailwind.config.ts .

CMD npm run dev

# Start Next.js in development mode based on the preferred package manager
# CMD \
#     if [ -f yarn.lock ]; then yarn dev; \
#     elif [ -f package-lock.json ]; then npm run dev; \
#     elif [ -f pnpm-lock.yaml ]; then pnpm dev; \
#     else yarn dev; \
#     fi