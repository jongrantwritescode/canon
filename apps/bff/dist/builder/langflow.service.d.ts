import { ConfigService } from "@nestjs/config";
export interface LangflowRequest {
    input_value: string;
    session_id?: string;
    output_type?: "text" | "json";
    input_type?: "text" | "json";
}
export interface LangflowResponse {
    result: string;
    session_id: string;
}
export declare class LangflowService {
    private configService;
    private readonly client;
    private readonly flowId;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(configService: ConfigService);
    runFlow(request: LangflowRequest): Promise<LangflowResponse>;
    testConnection(): Promise<any>;
    generateUniverse(prompt: string, sessionId?: string): Promise<string>;
    generateWorld(prompt: string, universeId?: string, sessionId?: string): Promise<string>;
    generateCharacter(prompt: string, universeId?: string, sessionId?: string): Promise<string>;
    generateCulture(prompt: string, universeId?: string, sessionId?: string): Promise<string>;
    generateTechnology(prompt: string, universeId?: string, sessionId?: string): Promise<string>;
}
