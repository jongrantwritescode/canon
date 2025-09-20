# Canon Environment Variables

## Required Environment Variables

### Langflow Configuration

- `LANGFLOW_API_KEY`: Your Langflow API key (required)
- `LANGFLOW_BASE_URL`: Langflow base URL (optional, defaults to http://localhost:7860)
- `LANGFLOW_FLOW_ID`: Langflow flow ID (optional, defaults to 4051bf48-02a2-46a6-8fd7-83ee074125d9)

### Neo4j Database Configuration

- `NEO4J_URI`: Neo4j connection URI (defaults to bolt://localhost:7687)
- `NEO4J_USER`: Neo4j username (defaults to neo4j)
- `NEO4J_PASSWORD`: Neo4j password (defaults to canon123)

### Application Configuration

- `NODE_ENV`: Node environment (defaults to development)
- `BFF_URL`: Backend for Frontend URL (defaults to http://localhost:3000)

## Setup Instructions

1. Create a `.env` file in the project root
2. Copy the required variables from this file
3. Set your `LANGFLOW_API_KEY` to your actual Langflow API key
4. Adjust other variables as needed for your environment

## Docker Compose

When using Docker Compose, environment variables are automatically configured. Make sure to set `LANGFLOW_API_KEY` in your environment before running `docker-compose up`.
