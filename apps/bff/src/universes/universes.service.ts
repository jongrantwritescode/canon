import { Injectable } from "@nestjs/common";
import { GraphService } from "../graph/graph.service";
import { MarkdownService } from "../common/markdown.service";
import { QueueService } from "../queue/queue.service";

@Injectable()
export class UniversesService {
  constructor(
    private readonly graphService: GraphService,
    private readonly markdownService: MarkdownService,
    private readonly queueService: QueueService
  ) {}

  async getUniverses() {
    return this.graphService.getUniverses();
  }

  async getUniverseById(id: string) {
    return this.graphService.getUniverseById(id);
  }

  async getUniverseContent(universeId: string) {
    return this.graphService.getUniverseContent(universeId);
  }

  async getCategoryContent(universeId: string, category: string) {
    const query = `
      MATCH (u:Universe {id: $universeId})-[:HAS_CATEGORY]->(c:Category {name: $category})
      MATCH (c)-[:HAS_PAGE]->(p)
      RETURN p.id as id, p.name as name, p.title as title, 
             p.markdown as markdown, labels(p) as labels
      ORDER BY p.title
    `;
    return this.graphService.runQuery(query, { universeId, category });
  }

  async getPageContent(pageId: string) {
    return this.graphService.getPageContent(pageId);
  }

  async createNewUniverse(prompt?: string) {
    // Queue universe generation job
    const jobId = await this.queueService.addBuildJob({
      type: "universe",
      prompt:
        prompt ||
        "Create a new universe with diverse worlds, interesting characters, unique cultures, and advanced technologies",
    });

    return {
      jobId,
      message: "Universe generation job queued",
      status: "queued",
    };
  }

  async createContent(universeId: string, type: string, prompt?: string) {
    // Validate content type
    const validTypes = ["world", "character", "culture", "technology"];
    if (!validTypes.includes(type)) {
      throw new Error(`Unknown content type: ${type}`);
    }

    // Queue content generation job
    const jobId = await this.queueService.addBuildJob({
      type: type as "world" | "character" | "culture" | "technology",
      universeId,
      prompt: prompt || `Create a new ${type} for this universe`,
    });

    return {
      jobId,
      message: `${type} generation job queued`,
      status: "queued",
      universeId,
    };
  }

  async getJobStatus(jobId: string) {
    return this.queueService.getJobStatus(jobId);
  }

  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  async processWebhookResult(webhookData: any) {
    const { jobId, success, data, error } = webhookData;

    if (!success) {
      console.error(`Job ${jobId} failed:`, error);
      return { success: false, error };
    }

    try {
      const { type, universeId, result } = data;

      // Process the result based on type
      if (type === "universe") {
        // Extract universe data from markdown result
        const universeData = this.extractUniverseData(result);
        const universe = await this.graphService.createUniverse(universeData);
        console.log(`Universe created: ${universe.id}`);
      } else {
        // Extract entity data from markdown result
        const entityData = this.extractEntityData(result, type, universeId);
        const page = await this.graphService.createPage(entityData);
        console.log(`${type} created: ${page.id}`);
      }

      // Process next job in queue
      await this.queueService.processNextJob();

      return { success: true, message: `${type} created successfully` };
    } catch (error) {
      console.error(`Error processing webhook result for job ${jobId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // HTML Rendering Methods
  renderUniversesList(universes: any[]): string {
    if (universes.length === 0) {
      return '<li class="universe-item">No universes found</li>';
    }

    return universes
      .map(
        (universe) => `
      <li class="universe-item" data-universe-id="${universe.id}" onclick="showUniverse('${universe.id}')">
        <strong>${universe.name}</strong>
        <br>
        <small>${universe.description || "No description"}</small>
      </li>
    `
      )
      .join("");
  }

  renderUniversePage(universe: any, content: any[]): string {
    const categories = content.filter((c) => c.category).map((c) => c.category);

    return `
      <div class="content-area">
        <div class="hero">
          <h1>${universe.name}</h1>
          <p>${universe.description || "A universe waiting to be explored"}</p>
          <button class="ds-button ds-button-secondary back-to-home">← Back to Home</button>
        </div>
        
        <div class="category-grid">
          ${categories
            .map(
              (category) => `
            <div class="category-card" onclick="loadCategory('${universe.id}', '${category}')">
              <h3>${this.getCategoryIcon(category)} ${category}</h3>
              <p>${this.getCategoryDescription(category)}</p>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div id="category-content"></div>
      </div>
    `;
  }

  renderCategoryContent(category: string, content: any[]): string {
    if (content.length === 0) {
      return `
        <div class="category-content">
          <h2>${category}</h2>
          <p>No ${category.toLowerCase()} found yet.</p>
          <button class="ds-button ds-button-primary" onclick="createContent('${category.toLowerCase()}')">
            Create ${category.slice(0, -1)}
          </button>
        </div>
      `;
    }

    return `
      <div class="category-content">
        <h2>${category}</h2>
        <div class="content-list">
          ${content
            .map(
              (item) => `
            <div class="content-item" onclick="loadPage('${item.id}')">
              <h3>${item.title || item.name}</h3>
              <p>${this.markdownService.extractSummary(item.markdown)}</p>
            </div>
          `
            )
            .join("")}
        </div>
        <button class="ds-button ds-button-primary" onclick="createContent('${category.toLowerCase()}')">
          Create ${category.slice(0, -1)}
        </button>
      </div>
    `;
  }

  renderPageFragment(page: any): string {
    const html = this.markdownService.convertToHtml(page.markdown);

    return `
      <div class="page-content">
        <h1>${page.title || page.name}</h1>
        <div class="markdown-content">
          ${html}
        </div>
      </div>
    `;
  }

  renderUniverseCreated(universe: any): string {
    return `
      <div class="universe-created">
        <h2>Universe Created!</h2>
        <p>Your new universe "${universe.name}" has been created.</p>
        <button class="ds-button ds-button-primary" onclick="showUniverse('${universe.id}')">
          Explore Universe
        </button>
      </div>
    `;
  }

  renderContentCreated(content: any): string {
    return `
      <div class="content-created">
        <h3>Content Created!</h3>
        <p>New content "${content.title}" has been added.</p>
        <button class="ds-button ds-button-primary" onclick="loadPage('${content.id}')">
          View Content
        </button>
      </div>
    `;
  }

  private getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      Worlds: "🌍",
      Characters: "👥",
      Cultures: "🏛️",
      Technologies: "⚡",
    };
    return icons[category] || "📄";
  }

  private getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      Worlds: "Explore planets, space stations, and other locations",
      Characters: "Meet intelligent beings and their stories",
      Cultures: "Discover societies and their values",
      Technologies: "Learn about advanced innovations",
    };
    return descriptions[category] || "Explore this category";
  }

  // ===== JSON API SERVICE METHODS =====

  async getCharacterRelationships(characterId: string): Promise<any> {
    const query = `
      MATCH (ch:Character {id: $characterId})
      OPTIONAL MATCH (ch)-[:FROM]->(w:World)
      OPTIONAL MATCH (ch)-[:BELONGS_TO]->(cu:Culture)
      RETURN ch.id as characterId, ch.name as characterName,
             w.id as homeworldId, w.name as homeworldName,
             cu.id as cultureId, cu.name as cultureName
    `;
    return this.graphService.runQuery(query, { characterId });
  }

  async getWorldInhabitants(worldId: string): Promise<any> {
    const query = `
      MATCH (w:World {id: $worldId})
      OPTIONAL MATCH (ch:Character)-[:FROM]->(w)
      OPTIONAL MATCH (cu:Culture)-[:LOCATED_ON]->(w)
      RETURN w.id as worldId, w.name as worldName,
             collect(DISTINCT {
               id: ch.id,
               name: ch.name,
               species: ch.species,
               role: ch.role,
               birthdate: ch.birthdate,
               deathDate: ch.deathDate
             }) as characters,
             collect(DISTINCT {
               id: cu.id,
               name: cu.name,
               species: cu.species,
               government: cu.government,
               technologyLevel: cu.technologyLevel
             }) as cultures
    `;
    return this.graphService.runQuery(query, { worldId });
  }

  async getCultureCharacters(cultureId: string): Promise<any> {
    const query = `
      MATCH (cu:Culture {id: $cultureId})
      OPTIONAL MATCH (ch:Character)-[:BELONGS_TO]->(cu)
      OPTIONAL MATCH (ch)-[:FROM]->(w:World)
      RETURN cu.id as cultureId, cu.name as cultureName,
             collect({
               id: ch.id,
               name: ch.name,
               species: ch.species,
               role: ch.role,
               homeworld: ch.homeworld,
               homeworldId: w.id,
               birthdate: ch.birthdate,
               deathDate: ch.deathDate,
               lifeEvents: ch.lifeEvents
             }) as characters
    `;
    return this.graphService.runQuery(query, { cultureId });
  }

  async getUniverseTimeline(universeId: string): Promise<any> {
    const query = `
      MATCH (u:Universe {id: $universeId})
      OPTIONAL MATCH (u)-[:HAS_CATEGORY]->(c:Category)-[:HAS_PAGE]->(ch:Character)
      WITH ch, ch.birthdate as eventYear, 'birth' as eventType, ch.name as eventName
      RETURN eventYear, eventType, eventName, ch.id as characterId, ch.species as species
      UNION ALL
      MATCH (u:Universe {id: $universeId})
      OPTIONAL MATCH (u)-[:HAS_CATEGORY]->(c:Category)-[:HAS_PAGE]->(ch:Character)
      WITH ch, ch.deathDate as eventYear, 'death' as eventType, ch.name as eventName
      RETURN eventYear, eventType, eventName, ch.id as characterId, ch.species as species
      ORDER BY eventYear ASC
    `;
    return this.graphService.runQuery(query, { universeId });
  }

  async getWorldsSpatial(): Promise<any> {
    const query = `
      MATCH (w:World)
      RETURN w.id as id, w.name as name, w.type as type,
             w.x as x, w.y as y, w.climate as climate,
             w.atmosphere as atmosphere, w.gravity as gravity,
             w.flora as flora, w.fauna as fauna
      ORDER BY w.name
    `;
    return this.graphService.runQuery(query);
  }

  // Utility methods for extracting data from markdown
  private extractUniverseData(markdown: string): any {
    // Extract name from markdown (first # heading)
    const nameMatch = markdown.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1] : "New Universe";

    const universeId = `u_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`;

    return {
      id: universeId,
      name: name,
      title: name,
      markdown: markdown,
      type: "Universe",
      createdAt: new Date().toISOString(),
    };
  }

  private extractEntityData(
    markdown: string,
    type: string,
    universeId?: string
  ): any {
    // Extract name from markdown (first # heading)
    const nameMatch = markdown.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1] : `New ${type}`;

    const prefix =
      type === "world"
        ? "w_"
        : type === "character"
          ? "ch_"
          : type === "culture"
            ? "cu_"
            : "t_";

    const entityId = `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`;

    return {
      id: entityId,
      name: name,
      title: name,
      markdown: markdown,
      type: type.charAt(0).toUpperCase() + type.slice(1),
      createdAt: new Date().toISOString(),
      universeId: universeId,
    };
  }
}
