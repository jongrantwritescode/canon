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
┌──────────────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Vite + DataStar Web UI   │────│   NestJS BFF    │────│   Neo4j Graph   │
│ (Standards UI tokens)    │    │   (TypeScript)  │    │     Service     │
└──────────────────────────┘    └─────────────────┘    └─────────────────┘
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
│   ├── web/          # Vite + DataStar-style Standards UI frontend
│   ├── bff/           # NestJS backend API
│   ├── graph/         # Neo4j graph service
│   └── builder/       # LangGraph content generation
├── docker-compose.yml
├── neo4j-seed.cypher
├── turbo.json
└── README.md
```

## 🛠️ Development

### Frontend architecture

The web client under `apps/web` now runs as a module-based Vite application. Standards UI is
initialised once in `src/main.ts` with Canon-specific design tokens from
`src/design-system/tokens.ts`, and DataStar-style stores in `src/state/app-store.ts` keep routing,
universe data, and queue polling in sync. Each view is a dedicated web component living under
`src/components/`:

- `<canon-app>` renders the shell, header navigation, and sidebar
- `<canon-universe-list>` / `<canon-universe-detail>` / `<canon-category-panel>` / `<canon-page-viewer>`
  cover the main navigation surfaces
- `<canon-queue-dashboard>` and `<canon-help>` provide queue monitoring and inline docs
- `<canon-universe-modal>` handles the Standards UI creation workflow

Use the existing npm scripts inside `apps/web` for development (`npm run dev`), linting (`npm run
lint`), and building (`npm run build`).

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

# Note: Graph service has been removed - graph functionality now handled directly by BFF

# Note: Builder service has been removed - LLM generation now handled directly by BFF
```

## 🎯 Usage

1. **Explore Universes**: Browse existing universes in the modular catalog
2. **Navigate Content**: Use the component-driven sidebar to jump between worlds, characters, cultures, and technologies
3. **Generate Content**: Queue new content from the universe shell and track progress in the queue dashboard
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

## 📄 License

This project is licensed under the MIT License.
