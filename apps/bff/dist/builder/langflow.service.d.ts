import { ConfigService } from "@nestjs/config";
export interface LangflowRequest {
    input_value: string | object;
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
    private readonly baseUrl;
    private readonly apiKey;
    private readonly flowId;
    constructor(configService: ConfigService);
    runFlow(request: LangflowRequest): Promise<LangflowResponse>;
    private getMockResponse;
    testConnection(): Promise<any>;
    generateWorld(universeId: string, sessionId?: string): Promise<string>;
    generateCharacter(universeId: string, sessionId?: string): Promise<string>;
    generateCulture(universeId: string, sessionId?: string): Promise<string>;
    generateTechnology(universeId: string, sessionId?: string): Promise<string>;
}
