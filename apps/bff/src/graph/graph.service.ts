import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import neo4j, { Driver, Integer, Node, Relationship, Session } from "neo4j-driver";

export interface GraphNodeData {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  caption?: string;
}

export interface GraphRelationshipData {
  id: string;
  type: string;
  start: string;
  end: string;
  properties: Record<string, unknown>;
}

export interface UniverseGraphData {
  nodes: GraphNodeData[];
  relationships: GraphRelationshipData[];
}

@Injectable()
export class GraphService {
  private driver: Driver;

  constructor(private configService: ConfigService) {
    const uri = this.configService.get<string>(
      "NEO4J_URI",
      "bolt://localhost:7687"
    );
    const user = this.configService.get<string>("NEO4J_USER", "neo4j");
    const password = this.configService.get<string>(
      "NEO4J_PASSWORD",
      "canon123"
    );

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
      return result.records.map((record) => record.toObject());
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
        title: COALESCE(p.title, p.name),
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
      RETURN p.id as id, p.name as name, COALESCE(p.title, p.name) as title,
             p.markdown as markdown, labels(p) as labels
    `;
    const results = await this.runQuery(query, { pageId });
    return results[0] || null;
  }

  async getUniverseGraph(universeId: string): Promise<UniverseGraphData> {
    const query = `
      MATCH (u:Universe {id: $universeId})
      OPTIONAL MATCH (u)-[:HAS_CATEGORY]->(c:Category)
      OPTIONAL MATCH (c)-[:HAS_PAGE]->(p)
      WITH collect(DISTINCT u) + collect(DISTINCT c) + collect(DISTINCT p) AS allNodes
      UNWIND allNodes AS node
      WITH collect(DISTINCT node) AS nodes
      UNWIND nodes AS source
      WITH nodes, source
      OPTIONAL MATCH (source)-[rel]->(target)
      WHERE target IN nodes
      WITH nodes, source, rel, target
      WHERE rel IS NOT NULL
      WITH nodes, collect(DISTINCT { rel: rel, start: source, end: target }) AS triples
      RETURN nodes, triples
    `;

    const results = await this.runQuery(query, { universeId });

    if (results.length === 0) {
      return { nodes: [], relationships: [] };
    }

    const [record] = results;
    const rawNodes = (record.nodes as Node[]) ?? [];
    const triples = (record.triples as Array<{
      rel: Relationship;
      start: Node;
      end: Node;
    }>) ?? [];

    const nodes: GraphNodeData[] = [];
    const relationships: GraphRelationshipData[] = [];
    const identityToId = new Map<string, string>();

    for (const node of rawNodes) {
      if (!node) {
        continue;
      }

      const identityKey = this.stringifyInteger(node.identity);
      const nodeId = this.resolveNodeId(node, identityKey);
      identityToId.set(identityKey, nodeId);

      const properties = this.serializeProperties(node.properties ?? {});
      const caption = this.resolveCaption(node, properties);

      nodes.push({
        id: nodeId,
        labels: [...node.labels],
        properties,
        ...(caption ? { caption } : {}),
      });
    }

    for (const triple of triples) {
      if (!triple?.rel || !triple.start || !triple.end) {
        continue;
      }

      const startKey = this.stringifyInteger(triple.start.identity);
      const endKey = this.stringifyInteger(triple.end.identity);
      const startId = identityToId.get(startKey);
      const endId = identityToId.get(endKey);

      if (!startId || !endId) {
        continue;
      }

      relationships.push({
        id: this.stringifyInteger(triple.rel.identity),
        type: triple.rel.type,
        start: startId,
        end: endId,
        properties: this.serializeProperties(triple.rel.properties ?? {}),
      });
    }

    return { nodes, relationships };
  }

  private stringifyInteger(value: Integer | number | string | null | undefined): string {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return value.toString();
    }

    if (neo4j.isInt(value)) {
      return value.inSafeRange() ? value.toNumber().toString() : value.toString();
    }

    return String(value);
  }

  private resolveNodeId(node: Node, fallback: string): string {
    const rawId = node.properties?.id;
    if (typeof rawId === "string" && rawId.trim().length > 0) {
      return rawId;
    }

    if (typeof rawId === "number") {
      return rawId.toString();
    }

    const rawName = node.properties?.name ?? node.properties?.title;
    if (typeof rawName === "string" && rawName.trim().length > 0) {
      const primaryLabel = node.labels[0] ?? "Node";
      return `${primaryLabel}:${rawName.trim()}:${fallback}`;
    }

    return fallback;
  }

  private resolveCaption(
    node: Node,
    properties: Record<string, unknown>
  ): string | undefined {
    const candidates: Array<unknown> = [
      properties.title,
      properties.name,
      properties.label,
      properties.id,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    if (node.labels.length > 0) {
      return node.labels[0];
    }

    return undefined;
  }

  private serializeProperties(
    properties: Record<string, any>
  ): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      output[key] = this.serializeValue(value);
    }

    return output;
  }

  private serializeValue(value: any): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (neo4j.isInt(value)) {
      return value.inSafeRange() ? value.toNumber() : value.toString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.serializeValue(item));
    }

    if (typeof value === "object") {
      const plain: Record<string, unknown> = {};
      for (const [entryKey, entryValue] of Object.entries(value)) {
        plain[entryKey] = this.serializeValue(entryValue);
      }
      return plain;
    }

    return value;
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
      MATCH (u:Universe {id: $universeId})
      MATCH (c:Category {name: $type})
      CREATE (p:Page {
        id: $id,
        name: $name,
        title: $title,
        markdown: $markdown,
        type: $type,
        createdAt: timestamp()
      })
      MERGE (c)-[:HAS_PAGE]->(p)
      RETURN p.id as id, p.name as name, p.title as title, p.type as type
    `;
    const results = await this.runQuery(query, pageData);
    return results[0];
  }

  async createCategory(
    universeId: string,
    categoryName: string,
    description: string
  ): Promise<any> {
    const query = `
      MATCH (u:Universe {id: $universeId})
      CREATE (c:Category {
        name: $categoryName,
        description: $description,
        createdAt: timestamp()
      })
      MERGE (u)-[:HAS_CATEGORY]->(c)
      RETURN c.name as name, c.description as description
    `;
    const results = await this.runQuery(query, {
      universeId,
      categoryName,
      description,
    });
    return results[0];
  }

  async createEmptyPlaceholder(
    universeId: string,
    categoryName: string,
    placeholderContent: string
  ): Promise<any> {
    const placeholderId = `placeholder_${categoryName.toLowerCase()}_${Date.now().toString(36)}`;

    const query = `
      MATCH (u:Universe {id: $universeId})
      MATCH (c:Category {name: $categoryName})
      CREATE (p:Page {
        id: $placeholderId,
        name: "Empty ${categoryName} Section",
        title: "Empty ${categoryName} Section", 
        markdown: $placeholderContent,
        type: "Placeholder",
        createdAt: timestamp()
      })
      MERGE (c)-[:HAS_PAGE]->(p)
      RETURN p.id as id, p.name as name, p.title as title, p.type as type
    `;
    const results = await this.runQuery(query, {
      universeId,
      categoryName,
      placeholderId,
      placeholderContent,
    });
    return results[0];
  }
}
