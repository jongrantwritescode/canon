import { Injectable } from '@nestjs/common';
import { GraphService } from '../graph/graph.service';
import { BuilderService } from '../builder/builder.service';
import { MarkdownService } from '../common/markdown.service';

@Injectable()
export class UniversesService {
  constructor(
    private readonly graphService: GraphService,
    private readonly builderService: BuilderService,
    private readonly markdownService: MarkdownService,
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

  async createNewUniverse() {
    // Generate universe using builder service
    const universeData = await this.builderService.generateUniverse();
    
    // Save to graph database
    const universe = await this.graphService.createUniverse(universeData);
    
    return universe;
  }

  async createContent(universeId: string, type: string, prompt?: string) {
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
    
    // Save to graph database
    const page = await this.graphService.createPage(contentData);
    
    return page;
  }

  // HTML Rendering Methods
  renderUniversesList(universes: any[]): string {
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

  renderUniversePage(universe: any, content: any[]): string {
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
      'Worlds': '🌍',
      'Characters': '👥',
      'Cultures': '🏛️',
      'Technologies': '⚡'
    };
    return icons[category] || '📄';
  }

  private getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      'Worlds': 'Explore planets, space stations, and other locations',
      'Characters': 'Meet intelligent beings and their stories',
      'Cultures': 'Discover societies and their values',
      'Technologies': 'Learn about advanced innovations'
    };
    return descriptions[category] || 'Explore this category';
  }
}
