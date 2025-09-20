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
const builder_service_1 = require("../builder/builder.service");
const markdown_service_1 = require("../common/markdown.service");
let UniversesService = class UniversesService {
    constructor(graphService, builderService, markdownService) {
        this.graphService = graphService;
        this.builderService = builderService;
        this.markdownService = markdownService;
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
        const universeData = await this.builderService.generateUniverse();
        const universe = await this.graphService.createUniverse(universeData);
        return universe;
    }
    async createContent(universeId, type, prompt) {
        let contentData;
        switch (type) {
            case 'world':
                contentData = await this.builderService.generateWorld(universeId, prompt);
                break;
            case 'character':
                contentData = await this.builderService.generateCharacter(universeId, prompt);
                break;
            case 'culture':
                contentData = await this.builderService.generateCulture(universeId, prompt);
                break;
            case 'technology':
                contentData = await this.builderService.generateTechnology(universeId, prompt);
                break;
            default:
                throw new Error(`Unknown content type: ${type}`);
        }
        const page = await this.graphService.createPage(contentData);
        return page;
    }
    renderUniversesList(universes) {
        if (universes.length === 0) {
            return '<li class="universe-item">No universes found</li>';
        }
        return universes.map(universe => `
      <li class="universe-item" data-universe-id="${universe.id}" onclick="showUniverse('${universe.id}')">
        <strong>${universe.name}</strong>
        <br>
        <small>${universe.description || 'No description'}</small>
      </li>
    `).join('');
    }
    renderUniversePage(universe, content) {
        const categories = content.filter(c => c.category).map(c => c.category);
        return `
      <div class="content-area">
        <div class="hero">
          <h1>${universe.name}</h1>
          <p>${universe.description || 'A universe waiting to be explored'}</p>
          <button class="ds-button ds-button-secondary back-to-home">← Back to Home</button>
        </div>
        
        <div class="category-grid">
          ${categories.map(category => `
            <div class="category-card" onclick="loadCategory('${universe.id}', '${category}')">
              <h3>${this.getCategoryIcon(category)} ${category}</h3>
              <p>${this.getCategoryDescription(category)}</p>
            </div>
          `).join('')}
        </div>
        
        <div id="category-content"></div>
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
          ${content.map(item => `
            <div class="content-item" onclick="loadPage('${item.id}')">
              <h3>${item.title || item.name}</h3>
              <p>${this.markdownService.extractSummary(item.markdown)}</p>
            </div>
          `).join('')}
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
            'Worlds': '🌍',
            'Characters': '👥',
            'Cultures': '🏛️',
            'Technologies': '⚡'
        };
        return icons[category] || '📄';
    }
    getCategoryDescription(category) {
        const descriptions = {
            'Worlds': 'Explore planets, space stations, and other locations',
            'Characters': 'Meet intelligent beings and their stories',
            'Cultures': 'Discover societies and their values',
            'Technologies': 'Learn about advanced innovations'
        };
        return descriptions[category] || 'Explore this category';
    }
};
exports.UniversesService = UniversesService;
exports.UniversesService = UniversesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [graph_service_1.GraphService,
        builder_service_1.BuilderService,
        markdown_service_1.MarkdownService])
], UniversesService);
//# sourceMappingURL=universes.service.js.map