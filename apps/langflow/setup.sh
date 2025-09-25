#!/bin/bash

# Langflow Docker Setup Script

echo "🚀 Setting up Langflow with PostgreSQL..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your LANGFLOW_API_KEY"
    echo "   Then run this script again."
    exit 1
fi

# Check if LANGFLOW_API_KEY is set
if ! grep -q "LANGFLOW_API_KEY=" .env || grep -q "LANGFLOW_API_KEY=your_api_key_here" .env; then
    echo "⚠️  Please set your LANGFLOW_API_KEY in .env file"
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo "🌐 Langflow UI: http://localhost:7861"
echo "🗄️  PostgreSQL: localhost:5433"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
