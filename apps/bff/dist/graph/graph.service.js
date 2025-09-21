"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const neo4j_driver_1 = require("neo4j-driver");
let GraphService = class GraphService {
    constructor(configService) {
        this.configService = configService;
        const uri = this.configService.get('NEO4J_URI', 'bolt://localhost:7687');
        const user = this.configService.get('NEO4J_USER', 'neo4j');
        const password = this.configService.get('NEO4J_PASSWORD', 'canon123');
        this.driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(user, password));
    }
    async onModuleDestroy() {
        await this.driver.close();
    }
    async getSession() {
        return this.driver.session();
    }
    async runQuery(query, parameters = {}) {
        const session = await this.getSession();
        try {
            const result = await session.run(query, parameters);
            return result.records.map(record => record.toObject());
        }
        finally {
            await session.close();
        }
    }
    async getUniverses() {
        const query = `
      MATCH (u:Universe)
      RETURN u.id as id, u.name as name, u.description as description, u.createdAt as createdAt
      ORDER BY u.createdAt DESC
    `;
        return this.runQuery(query);
    }
    async getUniverseById(id) {
        const query = `
      MATCH (u:Universe {id: $id})
      OPTIONAL MATCH (u)-[:HAS_CATEGORY]->(c:Category)
      RETURN u.id as id, u.name as name, u.description as description, 
             u.createdAt as createdAt, collect(c.name) as categories
    `;
        const results = await this.runQuery(query, { id });
        return results[0] || null;
    }
    async getUniverseContent(universeId) {
        const query = `
      MATCH (u:Universe {id: $universeId})
      OPTIONAL MATCH (u)-[:HAS_CATEGORY]->(c:Category)
      WHERE c IS NOT NULL
      OPTIONAL MATCH (c)-[:HAS_PAGE]->(p)
      WITH c, collect(CASE WHEN p IS NOT NULL THEN {
        id: p.id,
        name: p.name,
        title: p.title,
        markdown: p.markdown,
        type: head(labels(p))
      } END) as collectedPages
      RETURN c.name as category,
             [page IN collectedPages WHERE page IS NOT NULL] as pages
    `;
        return this.runQuery(query, { universeId });
    }
    async getPageContent(pageId) {
        const query = `
      MATCH (p {id: $pageId})
      RETURN p.id as id, p.name as name, p.title as title, 
             p.markdown as markdown, labels(p) as labels
    `;
        const results = await this.runQuery(query, { pageId });
        return results[0] || null;
    }
    async createUniverse(universeData) {
        const query = `
      CREATE (u:Universe {
        id: $id,
        name: $name,
        description: $title,
        createdAt: timestamp()
      })
      RETURN u.id as id, u.name as name, u.description as description
    `;
        const results = await this.runQuery(query, universeData);
        return results[0];
    }
    async createPage(pageData) {
        const query = `
      CREATE (p:Page {
        id: $id,
        title: $title,
        markdown: $markdown,
        createdAt: timestamp()
      })
      RETURN p.id as id, p.title as title
    `;
        const results = await this.runQuery(query, pageData);
        return results[0];
    }
};
exports.GraphService = GraphService;
exports.GraphService = GraphService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GraphService);
//# sourceMappingURL=graph.service.js.map