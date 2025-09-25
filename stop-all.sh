#!/bin/bash

# Stop Langflow services
echo "Stopping Langflow services..."
cd apps/langflow
docker-compose down

# Stop main Canon services
echo "Stopping Canon services..."
cd ../..
docker-compose down

echo "All services stopped!"
