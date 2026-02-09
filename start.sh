#!/bin/sh
set -e

echo "Running migrations..."
node /prisma-cli/node_modules/prisma/build/index.js migrate deploy --schema prisma/schema.prisma
echo "Migrations complete."

echo "Starting server..."
exec node server.js
