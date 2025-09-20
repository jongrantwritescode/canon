# Canon Universe Builder - Setup Guide

This document provides a **checklist** and detailed steps to create a repository for Canon, an LLM-driven universe builder. It includes dummy graph data for Neo4j and a monorepo structure using Turbo.

---

## ✅ Checklist

- [x] **Repo structure**

  - [x] `apps/web` (HTMX frontend with standards-ui)
  - [x] `apps/bff` (NestJS backend)
  - [x] `apps/graph` (Neo4j graph service)
  - [x] `apps/builder` (LangGraph service)
  - [x] `turbo.json` (Turbo configuration)
  - [x] `docker-compose.yml`
  - [x] `neo4j-seed.cypher`
  - [x] `README.md`

- [x] **Services**

  - [x] Neo4j container
  - [x] BFF (NestJS) container
  - [x] Builder service container
  - [x] Static web container

- [x] **Features**

  - [x] Index page with universes
  - [x] htmx navigation (universes → categories → pages)
  - [x] BFF REST returns HTML fragments
  - [x] Markdown stored in Neo4j, converted to HTML
  - [x] Button to call LLM service and generate a new universe

- [x] **Dummy data**
  - [x] One demo universe (Aetheria Prime)
  - [x] Categories: Worlds, Characters, Cultures, Technologies
  - [x] Rich pages with Markdown content

---

## 📂 Repository Structure

```
hackathon-universe-wiki/
├── apps/
│   ├── bff/                # NestJS backend
│   ├── web/                # Static HTML + htmx
│   │   └── public/index.html
│   └── llm/                # FastAPI service (Langflow export)
├── docker-compose.yml
├── neo4j-seed.cypher
└── README.md
```

---

## ⚡ Steps to Create Repository

### 1. Initialize Repo

```bash
mkdir hackathon-universe-wiki
cd hackathon-universe-wiki
git init
```

### 2. Create Subdirectories

```bash
mkdir -p apps/bff apps/web/public apps/llm
```

### 3. Add Static Frontend

Create `apps/web/public/index.html` with htmx and placeholder UI.

### 4. Setup BFF (NestJS)

- Minimal NestJS app
- Endpoints:
  - `GET /universes` → list universes (HTML `<li>`)
  - `GET /universes/:id/wiki` → nav + categories
  - `GET /universes/:id/category/:name` → pages
  - `GET /page/:id/fragment` → Markdown→HTML
  - `POST /universes/new` → call LLM service, save to Neo4j

### 5. Setup LLM Service (FastAPI)

- Endpoint: `POST /generate_universe`
- Returns JSON with dummy universe (id, name, categories, pages)

### 6. Docker Compose

Define services for:

- **neo4j**
- **bff**
- **llm**
- **web**

### 7. Seed Dummy Data

Add `neo4j-seed.cypher` with sample universe, categories, and pages.

---

## 🌱 Dummy Data (neo4j-seed.cypher)

```cypher
MERGE (u:Universe {id:'u_demo'}) SET u.name='Demo Universe', u.createdAt=timestamp();

UNWIND ['Worlds','Beings','Cultures'] AS cname
MERGE (c:Category {name:cname})
MERGE (u)-[:HAS_CATEGORY]->(c);

MERGE (p1:Page {id:'p_world1'})
  SET p1.title='Xalara Prime',
      p1.markdown='# Xalara Prime\nA rocky desert world rich in minerals.'
WITH u
MATCH (u)-[:HAS_CATEGORY]->(c:Category {name:'Worlds'})
MERGE (c)-[:HAS_PAGE]->(p1);

MERGE (p2:Page {id:'p_being1'})
  SET p2.title='Thrask',
      p2.markdown='# Thrask\nA sapient reptilian species with strong traditions.'
WITH u
MATCH (u)-[:HAS_CATEGORY]->(c:Category {name:'Beings'})
MERGE (c)-[:HAS_PAGE]->(p2);

MERGE (p3:Page {id:'p_culture1'})
  SET p3.title='Silent Chorus',
      p3.markdown='# Silent Chorus\nA monastic order that communicates through song.'
WITH u
MATCH (u)-[:HAS_CATEGORY]->(c:Category {name:'Cultures'})
MERGE (c)-[:HAS_PAGE]->(p3);
```

---

## ▶️ Run It All

1. Start services:

```bash
docker compose up
```

2. Open browser at:

- Static web: `http://localhost:8080`
- BFF: `http://localhost:3000`
- LLM service: `http://localhost:8000`
- Neo4j browser: `http://localhost:7474`

3. Click **Create Universe** or explore **Demo Universe**.

---
