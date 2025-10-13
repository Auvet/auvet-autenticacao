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

RUN echo '#!/bin/bash\n\
echo "Starting AUVET Authentication Service..."\n\
\n\
# Wait for MySQL to be ready on host\n\
while ! nc -z host.docker.internal 3307; do\n\
  echo "Waiting for MySQL on host.docker.internal:3307..."\n\
  sleep 1\n\
done\n\
echo "Database is ready!"\n\
\n\
# Generate Prisma client\n\
echo "Generating Prisma client..."\n\
npx prisma generate\n\
\n\
# Push database schema (apenas tabelas de auth se necessário)\n\
echo "Pushing database schema..."\n\
npx prisma db push\n\
\n\
# Run lint\n\
echo "Running lint..."\n\
npm run lint:check\n\
\n\
# Run tests\n\
echo "Running tests..."\n\
npm test\n\
\n\
echo "Tests completed successfully!"\n\
echo "Starting application..."\n\
exec "$@"' > /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["npm", "run", "dev"]

