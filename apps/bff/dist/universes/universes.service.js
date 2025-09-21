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
exports.UniversesService = void 0;
const common_1 = require("@nestjs/common");
const graph_service_1 = require("../graph/graph.service");
const markdown_service_1 = require("../common/markdown.service");
const queue_service_1 = require("../queue/queue.service");
let UniversesService = class UniversesService {
    constructor(graphService, markdownService, queueService) {
        this.graphService = graphService;
        this.markdownService = markdownService;
        this.queueService = queueService;
    }
    async getUniverses() {
        return this.graphService.getUniverses();
    }
    async getUniverseById(id) {
        return this.graphService.getUniverseById(id);
    }
    async getUniverseContent(universeId) {
        return this.graphService.getUniverseContent(universeId);
    }
    async getCategoryContent(universeId, category) {
        const query = `
      MATCH (u:Universe {id: $universeId})-[:HAS_CATEGORY]->(c:Category {name: $category})
      MATCH (c)-[:HAS_PAGE]->(p)
      RETURN p.id as id, p.name as name, p.title as title, 
             p.markdown as markdown, labels(p) as labels
      ORDER BY p.title
    `;
        return this.graphService.runQuery(query, { universeId, category });
    }
    async getPageContent(pageId) {
        return this.graphService.getPageContent(pageId);
    }
    async createNewUniverse() {
        const universeId = `u_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`;
        const universeData = {
            id: universeId,
            name: "New Universe",
            title: "New Universe",
            markdown: "# New Universe\n\nA universe waiting to be explored and developed.",
            type: "Universe",
            createdAt: new Date().toISOString(),
        };
        const universe = await this.graphService.createUniverse(universeData);
        return {
            universe,
            message: "Universe created successfully",
            status: "created",
        };
    }
    async createContent(universeId, type) {
        const validTypes = ["world", "character", "culture", "technology"];
        if (!validTypes.includes(type)) {
            throw new Error(`Unknown content type: ${type}`);
        }
        const jobId = await this.queueService.addBuildJob({
            type: type,
            universeId,
        });
        return {
            jobId,
            message: `${type} generation job queued`,
            status: "queued",
            universeId,
        };
    }
    async getJobStatus(jobId) {
        return this.queueService.getJobStatus(jobId);
    }
    async getQueueStats() {
        return this.queueService.getQueueStats();
    }
    async processWebhookResult(webhookData) {
        const { jobId, success, data, error } = webhookData;
        if (!success) {
            console.error(`Job ${jobId} failed:`, error);
            return { success: false, error };
        }
        try {
            const { type, universeId, result } = data;
            const entityData = this.extractEntityData(result, type, universeId);
            const page = await this.graphService.createPage(entityData);
            console.log(`${type} created: ${page.id}`);
            await this.queueService.processNextJob();
            return { success: true, message: `${type} created successfully` };
        }
        catch (error) {
            console.error(`Error processing webhook result for job ${jobId}:`, error);
            return { success: false, error: error.message };
        }
    }
    renderUniversesList(universes) {
        if (universes.length === 0) {
            return '<li class="universe-item">No universes found</li>';
        }
        return universes
            .map((universe) => `
      <li class="universe-item" data-universe-id="${universe.id}" onclick="showUniverse('${universe.id}')">
        <strong>${universe.name}</strong>
        <br>
        <small>${universe.description || "No description"}</small>
      </li>
    `)
            .join("");
    }
    renderUniversePage(universe, content) {
        const categories = content
            .filter((c) => c && c.category)
            .map((c) => ({
            name: c.category,
            pages: Array.isArray(c.pages) ? c.pages.filter(Boolean) : [],
        }));
        const categoryCards = categories
            .map((category) => `
          <div class="category-card" onclick="loadCategory('${universe.id}', '${category.name}')">
            <h3>${this.getCategoryIcon(category.name)} ${category.name}</h3>
            <p>${this.getCategoryDescription(category.name)}</p>
          </div>
        `)
            .join("");
        const categorySections = categories
            .map((category) => {
            const pages = category.pages.filter((page) => page && page.id);
            const items = pages
                .map((page) => {
                const title = page.title || page.name || "Untitled";
                const summary = page.markdown
                    ? this.markdownService.extractSummary(page.markdown)
                    : "";
                const description = summary || "Click to read more.";
                return `
              <article class="content-item" onclick="loadPage('${page.id}')">
                <h3>${title}</h3>
                <p>${description}</p>
              </article>
            `;
            })
                .join("");
            const emptyState = `
          <p class="empty-category">No ${category.name.toLowerCase()} available yet.</p>
        `;
            return `
          <section class="category-section" data-category="${category.name}">
            <header class="category-section-header">
              <div>
                <h2>${this.getCategoryIcon(category.name)} ${category.name}</h2>
                <p>${this.getCategoryDescription(category.name)}</p>
              </div>
              <button class="ds-button ds-button-secondary" onclick="loadCategory('${universe.id}', '${category.name}')">
                View all ${category.name.toLowerCase()}
              </button>
            </header>
            <div class="category-section-content">
              ${items || emptyState}
            </div>
            <footer class="category-section-footer">
              <button class="ds-button ds-button-primary" onclick="createContent('${category.name.toLowerCase()}')">
                Create ${category.name.slice(0, -1)}
              </button>
            </footer>
          </section>
        `;
        })
            .join("");
        const noContentMessage = `
      <p class="empty-universe">No categories found for this universe yet. Try generating new content to get started.</p>
    `;
        return `
      <div class="content-area">
        <div class="hero">
          <h1>${universe.name}</h1>
          <p>${universe.description || "A universe waiting to be explored"}</p>
          <button class="wiki-btn wiki-btn-secondary back-to-home">← Back to Home</button>
        </div>

        <div class="category-grid">
          ${categoryCards}
        </div>

        <div class="category-sections">
          ${categorySections || noContentMessage}
        </div>
      </div>
    `;
    }
    renderCategoryContent(category, content) {
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
            .map((item) => `
            <div class="content-item" onclick="loadPage('${item.id}')">
              <h3>${item.title || item.name}</h3>
              <p>${this.markdownService.extractSummary(item.markdown)}</p>
            </div>
          `)
            .join("")}
        </div>
        <button class="ds-button ds-button-primary" onclick="createContent('${category.toLowerCase()}')">
          Create ${category.slice(0, -1)}
        </button>
      </div>
    `;
    }
    renderPageFragment(page) {
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
    renderUniverseCreated(universe) {
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
    renderContentCreated(content) {
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
    getCategoryIcon(category) {
        const icons = {
            Worlds: "🌍",
            Characters: "👥",
            Cultures: "🏛️",
            Technologies: "⚡",
        };
        return icons[category] || "📄";
    }
    getCategoryDescription(category) {
        const descriptions = {
            Worlds: "Explore planets, space stations, and other locations",
            Characters: "Meet intelligent beings and their stories",
            Cultures: "Discover societies and their values",
            Technologies: "Learn about advanced innovations",
        };
        return descriptions[category] || "Explore this category";
    }
    async getCharacterRelationships(characterId) {
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
    async getWorldInhabitants(worldId) {
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
    async getCultureCharacters(cultureId) {
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
    async getUniverseTimeline(universeId) {
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
    async getWorldsSpatial() {
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
    extractUniverseData(markdown) {
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
    extractEntityData(markdown, type, universeId) {
        const nameMatch = markdown.match(/^#\s+(.+)$/m);
        const name = nameMatch ? nameMatch[1] : `New ${type}`;
        const prefix = type === "world"
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
};
exports.UniversesService = UniversesService;
exports.UniversesService = UniversesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_service_1.GraphService,
        markdown_service_1.MarkdownService,
        queue_service_1.QueueService])
], UniversesService);
//# sourceMappingURL=universes.service.js.map