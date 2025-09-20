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
exports.LangflowService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const langflow_client_1 = require("@datastax/langflow-client");
let LangflowService = class LangflowService {
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get("LANGFLOW_API_KEY");
        this.baseUrl = this.configService.get("LANGFLOW_BASE_URL", "http://localhost:7860");
        if (!this.apiKey) {
            throw new Error("LANGFLOW_API_KEY environment variable not found. Please set your API key in the environment variables.");
        }
        this.client = new langflow_client_1.LangflowClient({
            baseUrl: this.baseUrl,
            apiKey: this.apiKey,
        });
        this.flowId = this.configService.get("LANGFLOW_FLOW_ID", "4051bf48-02a2-46a6-8fd7-83ee074125d9");
    }
    async runFlow(request) {
        try {
            const flow = this.client.flow(this.flowId);
            const response = await flow.run(request.input_value, {
                session_id: request.session_id || "default_session",
            });
            let result = "";
            if (typeof response.outputs === "string") {
                result = response.outputs;
            }
            else if (Array.isArray(response.outputs) &&
                response.outputs.length > 0) {
                const firstOutput = response.outputs[0];
                if (typeof firstOutput === "string") {
                    result = firstOutput;
                }
                else if (firstOutput &&
                    typeof firstOutput === "object" &&
                    firstOutput.outputs) {
                    result = Array.isArray(firstOutput.outputs)
                        ? firstOutput.outputs.join("")
                        : String(firstOutput.outputs);
                }
            }
            return {
                result: result,
                session_id: request.session_id || "default_session",
            };
        }
        catch (error) {
            console.error("Error calling Langflow:", error);
            throw new Error(`Failed to call Langflow: ${error.message}`);
        }
    }
    async testConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/flows`, {
                headers: {
                    "x-api-key": this.apiKey,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const flows = await response.json();
            return {
                success: true,
                flows: flows,
                message: `Found ${Array.isArray(flows) ? flows.length : "unknown number of"} flows`,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                message: "Failed to connect to Langflow or retrieve flows",
            };
        }
    }
    async generateUniverse(prompt, sessionId) {
        const enhancedPrompt = `Generate a detailed universe with the following characteristics:
- Name and title
- Overview and description
- Structure including worlds, characters, cultures, and technologies
- Development status and potential for expansion

User prompt: ${prompt}

Please format the response as detailed markdown with proper sections and structure.`;
        const response = await this.runFlow({
            input_value: enhancedPrompt,
            session_id: sessionId || "universe_generation",
            output_type: "text",
        });
        return response.result;
    }
    async generateWorld(prompt, universeId, sessionId) {
        const enhancedPrompt = `Generate a detailed world for a universe with the following characteristics:
- Name and title
- Geography and climate
- Resources and environment
- Inhabitants and species
- Technology level
- Cultural aspects

Universe context: ${universeId ? `Part of universe ${universeId}` : "Standalone world"}
User prompt: ${prompt}

Please format the response as detailed markdown with proper sections and structure.`;
        const response = await this.runFlow({
            input_value: enhancedPrompt,
            session_id: sessionId || "world_generation",
            output_type: "text",
        });
        return response.result;
    }
    async generateCharacter(prompt, universeId, sessionId) {
        const enhancedPrompt = `Generate a detailed character for a universe with the following characteristics:
- Name and title
- Background and species
- Personality traits
- Abilities and skills
- Relationships and connections
- Role in the universe

Universe context: ${universeId ? `Part of universe ${universeId}` : "Standalone character"}
User prompt: ${prompt}

Please format the response as detailed markdown with proper sections and structure.`;
        const response = await this.runFlow({
            input_value: enhancedPrompt,
            session_id: sessionId || "character_generation",
            output_type: "text",
        });
        return response.result;
    }
    async generateCulture(prompt, universeId, sessionId) {
        const enhancedPrompt = `Generate a detailed culture for a universe with the following characteristics:
- Name and title
- Overview and core values
- Social structure and governance
- Traditions and customs
- Technology and innovation
- Art and cultural artifacts

Universe context: ${universeId ? `Part of universe ${universeId}` : "Standalone culture"}
User prompt: ${prompt}

Please format the response as detailed markdown with proper sections and structure.`;
        const response = await this.runFlow({
            input_value: enhancedPrompt,
            session_id: sessionId || "culture_generation",
            output_type: "text",
        });
        return response.result;
    }
    async generateTechnology(prompt, universeId, sessionId) {
        const enhancedPrompt = `Generate a detailed technology for a universe with the following characteristics:
- Name and title
- Overview and principles
- Function and operation
- Energy sources and materials
- Applications and uses
- Impact on society
- Development history

Universe context: ${universeId ? `Part of universe ${universeId}` : "Standalone technology"}
User prompt: ${prompt}

Please format the response as detailed markdown with proper sections and structure.`;
        const response = await this.runFlow({
            input_value: enhancedPrompt,
            session_id: sessionId || "technology_generation",
            output_type: "text",
        });
        return response.result;
    }
};
exports.LangflowService = LangflowService;
exports.LangflowService = LangflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LangflowService);
//# sourceMappingURL=langflow.service.js.map