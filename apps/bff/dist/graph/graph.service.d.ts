import { ConfigService } from "@nestjs/config";
import { Session } from "neo4j-driver";
export declare class GraphService {
    private configService;
    private driver;
    constructor(configService: ConfigService);
    onModuleDestroy(): Promise<void>;
    getSession(): Promise<Session>;
    runQuery(query: string, parameters?: any): Promise<any[]>;
    getUniverses(): Promise<any[]>;
    getUniverseById(id: string): Promise<any>;
    getUniverseContent(universeId: string): Promise<any>;
    getPageContent(pageId: string): Promise<any>;
    createUniverse(universeData: any): Promise<any>;
    createPage(pageData: any): Promise<any>;
}
