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
let LangflowService = class LangflowService {
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get("LANGFLOW_API_KEY");
        this.baseUrl = this.configService.get("LANGFLOW_BASE_URL", "http://localhost:7860");
        if (!this.apiKey) {
            throw new Error("LANGFLOW_API_KEY environment variable not found. Please set your API key in the environment variables.");
        }
        this.flowId = this.configService.get("LANGFLOW_FLOW_ID", "4051bf48-02a2-46a6-8fd7-83ee074125d9");
    }
    async runFlow(request) {
        try {
            const inputValue = typeof request.input_value === "string"
                ? request.input_value
                : JSON.stringify(request.input_value);
            const response = await fetch(`${this.baseUrl}/api/v1/flows/${this.flowId}/run`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.apiKey,
                },
                body: JSON.stringify({
                    input_value: inputValue,
                    session_id: request.session_id || "default_session",
                }),
            });
            if (!response.ok) {
                console.warn(`Langflow API returned ${response.status}: ${response.statusText}. Using mock data.`);
                return this.getMockResponse(request);
            }
            const data = await response.json();
            let result = "";
            if (typeof data.outputs === "string") {
                result = data.outputs;
            }
            else if (Array.isArray(data.outputs) && data.outputs.length > 0) {
                const firstOutput = data.outputs[0];
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
            console.warn("Langflow service unavailable. Using mock data.");
            return this.getMockResponse(request);
        }
    }
    getMockResponse(request) {
        const mockWorld = {
            name: "Mock World Alpha",
            universe_location: { x: 150, y: 200 },
            size: { diameter_km: 12000, gravity_g: 0.8 },
            orbit: {
                star_type: "G-type",
                orbital_period_days: 365,
                distance_from_star_au: 1.2,
                moons: 2,
            },
            atmosphere: {
                composition: ["Nitrogen", "Oxygen", "Argon"],
                breathable_for_humans: true,
            },
            geography: {
                continents: [
                    "Northern Continent - vast plains and forests",
                    "Southern Archipelago - volcanic islands",
                ],
                oceans: ["Central Ocean - deep blue waters with coral reefs"],
                mountain_ranges: ["Eastern Peaks - towering snow-capped mountains"],
                deserts: ["Western Sands - endless dunes"],
                polar_regions: ["Ice caps with seasonal melting"],
            },
            climate: {
                global_average_temp_c: 15,
                seasonal_patterns: "Moderate seasons with wet and dry periods",
                precipitation: "Regular rainfall, occasional storms",
            },
            biomes: [
                {
                    name: "Temperate Forest",
                    climate: "Moderate temperature, high humidity",
                    flora: [
                        "Giant Oak Trees - adapted to seasonal changes",
                        "Moss-covered rocks",
                    ],
                    fauna: ["Forest Deer - agile climbers", "Tree-dwelling birds"],
                },
                {
                    name: "Coastal Wetlands",
                    climate: "Humid, brackish water",
                    flora: ["Mangrove-like trees", "Salt-tolerant grasses"],
                    fauna: ["Amphibious creatures", "Water-dwelling fish"],
                },
            ],
            phenomena: [
                "Aurora-like light displays during magnetic storms",
                "Tidal pools that glow at night",
            ],
        };
        return {
            result: JSON.stringify(mockWorld, null, 2),
            session_id: request.session_id || "default_session",
        };
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
    async generateWorld(universeId, sessionId) {
        const requestData = {
            universeId: universeId,
            type: "world",
            action: "generate",
        };
        console.log("Starting world generation");
        const response = await this.runFlow({
            input_value: requestData,
            session_id: sessionId || "world_generation",
            output_type: "text",
            input_type: "json",
        });
        console.log("Langflow response:", JSON.stringify(response.result));
        return response.result;
    }
    async generateCharacter(universeId, sessionId) {
        const requestData = {
            universeId: universeId,
            type: "character",
            action: "generate",
        };
        const response = await this.runFlow({
            input_value: requestData,
            session_id: sessionId || "character_generation",
            output_type: "text",
            input_type: "json",
        });
        return response.result;
    }
    async generateCulture(universeId, sessionId) {
        const requestData = {
            universeId: universeId,
            type: "culture",
            action: "generate",
        };
        const response = await this.runFlow({
            input_value: requestData,
            session_id: sessionId || "culture_generation",
            output_type: "text",
            input_type: "json",
        });
        return response.result;
    }
    async generateTechnology(universeId, sessionId) {
        const requestData = {
            universeId: universeId,
            type: "technology",
            action: "generate",
        };
        const response = await this.runFlow({
            input_value: requestData,
            session_id: sessionId || "technology_generation",
            output_type: "text",
            input_type: "json",
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