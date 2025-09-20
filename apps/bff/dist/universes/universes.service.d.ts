import { GraphService } from '../graph/graph.service';
import { BuilderService } from '../builder/builder.service';
import { MarkdownService } from '../common/markdown.service';
export declare class UniversesService {
    private readonly graphService;
    private readonly builderService;
    private readonly markdownService;
    constructor(graphService: GraphService, builderService: BuilderService, markdownService: MarkdownService);
    getUniverses(): Promise<any[]>;
    getUniverseById(id: string): Promise<any>;
    getUniverseContent(universeId: string): Promise<any>;
    getCategoryContent(universeId: string, category: string): Promise<any[]>;
    getPageContent(pageId: string): Promise<any>;
    createNewUniverse(): Promise<any>;
    createContent(universeId: string, type: string, prompt?: string): Promise<any>;
    renderUniversesList(universes: any[]): string;
    renderUniversePage(universe: any, content: any[]): string;
    renderCategoryContent(category: string, content: any[]): string;
    renderPageFragment(page: any): string;
    renderUniverseCreated(universe: any): string;
    renderContentCreated(content: any): string;
    private getCategoryIcon;
    private getCategoryDescription;
}
