import { GraphService } from "../graph/graph.service";
import { MarkdownService } from "../common/markdown.service";
import { QueueService } from "../queue/queue.service";
export declare class UniversesService {
    private readonly graphService;
    private readonly markdownService;
    private readonly queueService;
    constructor(graphService: GraphService, markdownService: MarkdownService, queueService: QueueService);
    getUniverses(): Promise<any[]>;
    getUniverseById(id: string): Promise<any>;
    getUniverseContent(universeId: string): Promise<any>;
    getCategoryContent(universeId: string, category: string): Promise<any[]>;
    getPageContent(pageId: string): Promise<any>;
    createNewUniverse(): Promise<{
        universe: any;
        message: string;
        status: string;
    }>;
    createContent(universeId: string, type: string): Promise<{
        jobId: string;
        message: string;
        status: string;
        universeId: string;
    }>;
    getJobStatus(jobId: string): Promise<any>;
    getQueueStats(): Promise<any>;
    processWebhookResult(webhookData: any): Promise<{
        success: boolean;
        error: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    renderUniversesList(universes: any[]): string;
    renderUniversePage(universe: any, content: any[]): string;
    renderCategoryContent(category: string, content: any[]): string;
    renderPageFragment(page: any): string;
    renderUniverseCreated(universe: any): string;
    renderContentCreated(content: any): string;
    private getCategoryIcon;
    private getCategoryDescription;
    getCharacterRelationships(characterId: string): Promise<any>;
    getWorldInhabitants(worldId: string): Promise<any>;
    getCultureCharacters(cultureId: string): Promise<any>;
    getUniverseTimeline(universeId: string): Promise<any>;
    getWorldsSpatial(): Promise<any>;
    private extractUniverseData;
    private extractEntityData;
}
