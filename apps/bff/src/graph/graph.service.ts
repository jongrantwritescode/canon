import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class GraphService {
  private driver: Driver;

  constructor(private configService: ConfigService) {
    const uri = this.configService.get<string>('NEO4J_URI', 'bolt://localhost:7687');
    const user = this.configService.get<string>('NEO4J_USER', 'neo4j');
    const password = this.configService.get<string>('NEO4J_PASSWORD', 'canon123');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }

  async onModuleDestroy() {
    await this.driver.close();
  }

  async getSession(): Promise<Session> {
    return this.driver.session();
  }

  async runQuery(query: string, parameters: any = {}): Promise<any[]> {
    const session = await this.getSession();
    try {
      const result = await session.run(query, parameters);
      return result.records.map(record => record.toObject());
    } finally {
      await session.close();
    }
  }

  async getUniverses(): Promise<any[]> {
    const query = `
      MATCH (u:Universe)
      RETURN u.id as id, u.name as name, u.description as description, u.createdAt as createdAt
      ORDER BY u.createdAt DESC
    `;
    return this.runQuery(query);
  }

  async getUniverseById(id: string): Promise<any> {
    const query = `
      MATCH (u:Universe {id: $id})
      OPTIONAL MATCH (u)-[:HAS_CATEGORY]->(c:Category)
      RETURN u.id as id, u.name as name, u.description as description, 
             u.createdAt as createdAt, collect(c.name) as categories
    `;
    const results = await this.runQuery(query, { id });
    return results[0] || null;
  }

  async getUniverseContent(universeId: string): Promise<any> {
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

  async getPageContent(pageId: string): Promise<any> {
    const query = `
      MATCH (p {id: $pageId})
      RETURN p.id as id, p.name as name, p.title as title, 
             p.markdown as markdown, labels(p) as labels
    `;
    const results = await this.runQuery(query, { pageId });
    return results[0] || null;
  }

  async createUniverse(universeData: any): Promise<any> {
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

  async createPage(pageData: any): Promise<any> {
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
}
