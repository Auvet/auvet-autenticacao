FROM node:18-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    netcat-traditional \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline

COPY . .

RUN npm run build

EXPOSE 4000

ENV DB_HOST=auth-db
ENV DB_PORT=3306

CMD ["bash", "-c", "set -e; \
echo 'Starting AUVET Authentication Service...'; \
DB_HOST=${DB_HOST:-auth-db}; \
DB_PORT=${DB_PORT:-3306}; \
while ! nc -z $DB_HOST $DB_PORT; do \
  echo \"Waiting for MySQL on $DB_HOST:$DB_PORT...\"; \
  sleep 1; \
done; \
echo 'Database is ready!'; \
echo 'Generating Prisma client...'; \
npx prisma generate; \
echo 'Pushing database schema...'; \
npx prisma db push; \
echo 'Running lint...'; \
npm run lint:check; \
echo 'Running tests...'; \
npm test; \
echo 'Tests completed successfully!'; \
echo 'Starting application...'; \
npm run dev"]

