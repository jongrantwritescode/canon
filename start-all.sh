#!/bin/bash

# Start main Canon services
echo "Starting Canon services..."
docker-compose up -d

# Start Langflow services
echo "Starting Langflow services..."
cd apps/langflow
docker-compose up -d

echo "All services started!"
echo "Canon Web: http://localhost:8080"
echo "Canon BFF: http://localhost:3000"
echo "Langflow: http://localhost:7861"
echo "Neo4j: http://localhost:7474"
