import { LangflowService } from "./langflow.service";
export declare class BuilderService {
    private langflowService;
    constructor(langflowService: LangflowService);
    generateUniverse(prompt?: string): Promise<any>;
    generateWorld(universeId: string, prompt?: string): Promise<any>;
    generateCharacter(universeId: string, prompt?: string): Promise<any>;
    generateCulture(universeId: string, prompt?: string): Promise<any>;
    generateTechnology(universeId: string, prompt?: string): Promise<any>;
}
