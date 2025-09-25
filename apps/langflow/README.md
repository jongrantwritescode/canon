# Langflow Docker Setup

A complete Docker Compose setup for running Langflow with PostgreSQL, designed for AI workflow automation and development.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Your Langflow API key

### Setup Steps

1. **Configure Environment**

   ```bash
   # Copy environment template
   cp env.example .env

   # Edit .env and add your API key
   nano .env
   ```

2. **Start Services**

   ```bash
   # Automated setup
   ./setup.sh

   # Or manually
   docker-compose up -d
   ```

3. **Access Services**
   - **Langflow UI**: http://localhost:7861
   - **PostgreSQL**: localhost:5433

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Langflow      │    │   PostgreSQL    │
│   Port: 7861    │◄──►│   Port: 5433    │
│   AI Workflows  │    │   Data Store    │
└─────────────────┘    └─────────────────┘
```

## 📋 Services

| Service        | Port | Description                     |
| -------------- | ---- | ------------------------------- |
| **Langflow**   | 7861 | AI workflow automation platform |
| **PostgreSQL** | 5433 | Database for persistent storage |

## ⚙️ Configuration

### Database Connection

- **Host**: postgres (internal), localhost:5433 (external)
- **Database**: langflow
- **Username**: postgres
- **Password**: canon123

### Volume Mounts

- `./flows` → `/app/flows` (Flow definitions)
- `postgres_data` → PostgreSQL data persistence

### Environment Variables

```bash
# Required
LANGFLOW_API_KEY=your_api_key_here

# Optional overrides
POSTGRES_USER=postgres
POSTGRES_PASSWORD=canon123
POSTGRES_DB=langflow
LANGFLOW_HOST=0.0.0.0
LANGFLOW_PORT=7860
LANGFLOW_LOG_LEVEL=INFO
```

## 🛠️ Management Commands

### Service Control

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# View service status
docker-compose ps
```

### Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f langflow
docker-compose logs -f postgres

# Follow logs in real-time
docker-compose logs --tail=50 -f
```

### Maintenance

```bash
# Rebuild and restart
docker-compose up -d --build

# Remove all data (reset)
docker-compose down -v

# Update images
docker-compose pull
docker-compose up -d
```

## 📁 Project Structure

```
apps/langflow/
├── docker-compose.yml    # Service definitions
├── setup.sh             # Automated setup script
├── env.example          # Environment template
├── README.md            # This file
└── flows/               # Flow definitions
    ├── canon.json       # Your flows
    └── ...
```

## 🔧 Troubleshooting

### Common Issues

**Port Conflicts**

```bash
# Check what's using ports
lsof -i :7861
lsof -i :5433

# Use different ports in docker-compose.yml
```

**Permission Errors**

```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./flows
```

**Service Won't Start**

```bash
# Check logs
docker-compose logs langflow

# Restart with clean state
docker-compose down -v
docker-compose up -d
```

### Health Checks

```bash
# Test Langflow API
curl http://localhost:7861/api/v1/flows

# Test PostgreSQL connection
docker-compose exec postgres psql -U postgres -d langflow -c "SELECT 1;"
```

## 🔗 Integration

### With Main Canon Project

This setup runs independently from the main Canon project:

- Uses different ports (7861 vs 7860)
- Separate PostgreSQL instance (5433 vs 5432)
- Isolated Docker network

### API Usage

```bash
# Example API calls
curl -X GET http://localhost:7861/api/v1/flows
curl -X POST http://localhost:7861/api/v1/flows/run \
  -H "Content-Type: application/json" \
  -d '{"flow_id": "your-flow-id"}'
```

## 📚 Resources

- [Langflow Documentation](https://docs.langflow.org/)
- [Langflow GitHub](https://github.com/langflow-ai/langflow)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🤝 Contributing

To modify this setup:

1. Edit `docker-compose.yml` for service changes
2. Update `env.example` for new environment variables
3. Modify `setup.sh` for automation changes
4. Update this README for documentation changes
