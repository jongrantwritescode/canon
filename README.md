# Canon - LLM-Driven Universe Builder

Canon is an AI-powered universe builder that creates rich, interconnected fictional worlds with geography, flora, fauna, intelligent species, cultures, and technologies.

## 🌟 Features

- **Universe Creation**: Generate entire fictional universes with LLM assistance
- **Rich Content**: Detailed worlds, characters, cultures, and technologies
- **Graph Relationships**: Neo4j-powered relationship mapping
- **Dynamic Navigation**: Schema-driven UI that adapts to universe structure
- **Content Generation**: AI-powered content creation for missing information
- **Markdown Support**: Rich text content with HTML conversion

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTMX Frontend │────│   NestJS BFF    │────│   Neo4j Graph   │
│   (standards-ui)│    │   (TypeScript)  │    │     Service     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐
                       │ LangGraph       │
                       │ Builder Service │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd canon
```

2. Install dependencies:

```bash
npm install
```

3. Start all services:

```bash
docker compose up
```

4. Access the application:

- **Frontend**: http://localhost:8080
- **BFF API**: http://localhost:3000
- **Builder Service**: http://localhost:8000
- **Neo4j Browser**: http://localhost:7474

## 📁 Project Structure

```
canon/
├── apps/
│   ├── web/           # HTMX frontend with standards-ui
│   ├── bff/           # NestJS backend API
│   ├── graph/         # Neo4j graph service
│   └── builder/       # LangGraph content generation
├── docker-compose.yml
├── neo4j-seed.cypher
├── turbo.json
└── README.md
```

## 🛠️ Development

### Running in Development

```bash
# Start all services
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### Individual Services

```bash
# Frontend only
cd apps/web && npm run dev

# Backend only
cd apps/bff && npm run dev

# Graph service only
cd apps/graph && npm run dev

# Builder service only
cd apps/builder && npm run dev
```

## 🎯 Usage

1. **Explore Universes**: Browse existing universes on the homepage
2. **Navigate Content**: Use the sidebar to explore worlds, characters, cultures
3. **Generate Content**: Click "Create Content" buttons to generate new content
4. **View Relationships**: Explore connections between different elements

## 🔧 Configuration

### Environment Variables

- `NEO4J_URI`: Neo4j connection string
- `NEO4J_USER`: Neo4j username
- `NEO4J_PASSWORD`: Neo4j password
- `BUILDER_SERVICE_URL`: LangGraph service URL

### Neo4j Setup

The seed data includes a demo universe "Aetheria Prime" with:

- 2 worlds (Terra Nova, Void Station Alpha)
- 2 characters (Captain Elena Reyes, Zara Thorn)
- 2 cultures (Terran Federation, Zephyrian Collective)
- 2 technologies (Quantum FTL Drive, Neural Link Interface)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
