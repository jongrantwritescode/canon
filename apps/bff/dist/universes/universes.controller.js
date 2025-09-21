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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const universes_service_1 = require("./universes.service");
const langflow_service_1 = require("../builder/langflow.service");
const universe_dto_1 = require("./dto/universe.dto");
let UniversesController = class UniversesController {
    constructor(universesService, langflowService) {
        this.universesService = universesService;
        this.langflowService = langflowService;
    }
    async getRoot(res) {
        res.setHeader("Content-Type", "text/html");
        res.send(`
      <div class="content-area">
        <div class="hero">
          <h1>Canon Universe Builder</h1>
          <p>Welcome to the Canon Universe Builder API</p>
          <p>Available endpoints:</p>
          <h3>Web Interface (HTML)</h3>
          <ul>
            <li><a href="/universes">GET /universes</a> - List all universes</li>
            <li><a href="/universes/u_demo">GET /universes/:id</a> - Get universe details</li>
            <li>POST /universes/new - Create new universe</li>
            <li>POST /universes/content/create - Create new content</li>
          </ul>
          <h3>JSON API Endpoints</h3>
          <ul>
            <li><a href="/api/universes">GET /api/universes</a> - List all universes (JSON)</li>
            <li><a href="/api/universes/u_demo">GET /api/universes/:id</a> - Get universe details (JSON)</li>
            <li><a href="/api/universes/u_demo/entities">GET /api/universes/:id/entities</a> - Get universe entities (JSON)</li>
            <li><a href="/api/entities/ch_captain_reyes">GET /api/entities/:id</a> - Get specific entity (JSON)</li>
            <li><a href="/api/characters/ch_captain_reyes/relationships">GET /api/characters/:id/relationships</a> - Get character relationships (JSON)</li>
            <li><a href="/api/worlds/w_terra_nova/inhabitants">GET /api/worlds/:id/inhabitants</a> - Get world inhabitants (JSON)</li>
            <li><a href="/api/cultures/cu_terran_federation/characters">GET /api/cultures/:id/characters</a> - Get culture characters (JSON)</li>
            <li><a href="/api/timeline/u_demo">GET /api/timeline/:universeId</a> - Get universe timeline (JSON)</li>
            <li><a href="/api/spatial/worlds">GET /api/spatial/worlds</a> - Get spatial world data (JSON)</li>
          </ul>
          <h3>API Documentation</h3>
          <p><a href="/api/docs" target="_blank">📚 OpenAPI/Swagger Documentation</a> - Interactive API documentation with examples and schemas</p>
        </div>
      </div>
    `);
    }
    async getUniversesList(res) {
        const universes = await this.universesService.getUniverses();
        const html = this.universesService.renderUniversesList(universes);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    }
    async getUniverse(id, res) {
        const universe = await this.universesService.getUniverseById(id);
        if (!universe) {
            res.status(404).send('<div class="error">Universe not found</div>');
            return;
        }
        const content = await this.universesService.getUniverseContent(id);
        const html = this.universesService.renderUniversePage(universe, content);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    }
    async getCategoryContent(id, category, res) {
        const content = await this.universesService.getCategoryContent(id, category);
        const html = this.universesService.renderCategoryContent(category, content);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    }
    async getPageFragment(id, res) {
        const page = await this.universesService.getPageContent(id);
        if (!page) {
            res.status(404).send('<div class="error">Page not found</div>');
            return;
        }
        const html = this.universesService.renderPageFragment(page);
        res.setHeader("Content-Type", "text/html");
        res.send(html);
    }
    async createUniverse(body, res) {
        try {
            const result = await this.universesService.createNewUniverse();
            res.setHeader("Content-Type", "text/html");
            res.send(`
        <div class="universe-created">
          <h2>Universe Created!</h2>
          <p>${result.message}</p>
          <p>Universe ID: ${result.universe.id}</p>
          <p>Status: ${result.status}</p>
          <button class="ds-button ds-button-primary" onclick="showUniverse('${result.universe.id}')">
            Explore Universe
          </button>
        </div>
      `);
        }
        catch (error) {
            console.error("Error creating universe:", error);
            res
                .status(500)
                .send('<div class="error">Failed to create universe</div>');
        }
    }
    async createContent(body, res) {
        try {
            const { universeId, type } = body;
            const result = await this.universesService.createContent(universeId, type);
            res.setHeader("Content-Type", "text/html");
            res.send(`
        <div class="content-queued">
          <h3>Content Generation Queued!</h3>
          <p>Job ID: ${result.jobId}</p>
          <p>${result.message}</p>
          <p>Status: ${result.status}</p>
          <button class="ds-button ds-button-primary" onclick="checkJobStatus('${result.jobId}')">
            Check Status
          </button>
        </div>
      `);
        }
        catch (error) {
            console.error("Error creating content:", error);
            res.status(500).send('<div class="error">Failed to create content</div>');
        }
    }
    async handleBuildComplete(body, res) {
        try {
            console.log("Received webhook:", body);
            if (!body.jobId || typeof body.success !== "boolean") {
                res.status(400).json({ error: "Invalid webhook data" });
                return;
            }
            const result = await this.universesService.processWebhookResult(body);
            res.status(200).json({
                success: true,
                message: "Webhook processed successfully",
                result,
            });
        }
        catch (error) {
            console.error("Error processing webhook:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getJobStatus(jobId, res) {
        try {
            const status = await this.universesService.getJobStatus(jobId);
            if (!status) {
                res.status(404).json({ error: "Job not found" });
                return;
            }
            res.setHeader("Content-Type", "application/json");
            res.json(status);
        }
        catch (error) {
            console.error("Error getting job status:", error);
            res.status(500).json({ error: error.message });
        }
    }
    async getQueueStats(res) {
        try {
            const stats = await this.universesService.getQueueStats();
            res.setHeader("Content-Type", "application/json");
            res.json(stats);
        }
        catch (error) {
            console.error("Error getting queue stats:", error);
            res.status(500).json({ error: error.message });
        }
    }
    async testLangflow(res) {
        try {
            const testResult = await this.langflowService.testConnection();
            res.setHeader("Content-Type", "application/json");
            res.send(testResult);
        }
        catch (error) {
            console.error("Error testing Langflow:", error);
            res.status(500).json({
                success: false,
                error: error.message,
                message: "Failed to test Langflow connection",
            });
        }
    }
    async getUniversesApi(res) {
        try {
            const universes = await this.universesService.getUniverses();
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: universes,
                count: universes.length,
            });
        }
        catch (error) {
            console.error("Error getting universes:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getUniverseApi(id, res) {
        try {
            const universe = await this.universesService.getUniverseById(id);
            if (!universe) {
                res.status(404).json({
                    success: false,
                    error: "Universe not found",
                });
                return;
            }
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: universe,
            });
        }
        catch (error) {
            console.error("Error getting universe:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getUniverseEntitiesApi(id, res) {
        try {
            const content = await this.universesService.getUniverseContent(id);
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: content,
            });
        }
        catch (error) {
            console.error("Error getting universe entities:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getEntityApi(id, res) {
        try {
            const entity = await this.universesService.getPageContent(id);
            if (!entity) {
                res.status(404).json({
                    success: false,
                    error: "Entity not found",
                });
                return;
            }
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: entity,
            });
        }
        catch (error) {
            console.error("Error getting entity:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getCharacterRelationshipsApi(id, res) {
        try {
            const relationships = await this.universesService.getCharacterRelationships(id);
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: relationships,
            });
        }
        catch (error) {
            console.error("Error getting character relationships:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getWorldInhabitantsApi(id, res) {
        try {
            const inhabitants = await this.universesService.getWorldInhabitants(id);
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: inhabitants,
            });
        }
        catch (error) {
            console.error("Error getting world inhabitants:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getCultureCharactersApi(id, res) {
        try {
            const characters = await this.universesService.getCultureCharacters(id);
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: characters,
            });
        }
        catch (error) {
            console.error("Error getting culture characters:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getUniverseTimelineApi(universeId, res) {
        try {
            const timeline = await this.universesService.getUniverseTimeline(universeId);
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: timeline,
            });
        }
        catch (error) {
            console.error("Error getting universe timeline:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    async getWorldsSpatialApi(res) {
        try {
            const worlds = await this.universesService.getWorldsSpatial();
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                data: worlds,
            });
        }
        catch (error) {
            console.error("Error getting spatial world data:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
};
exports.UniversesController = UniversesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getRoot", null);
__decorate([
    (0, common_1.Get)("universes"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getUniversesList", null);
__decorate([
    (0, common_1.Get)("universes/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getUniverse", null);
__decorate([
    (0, common_1.Get)("universes/:id/category/:category"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Param)("category")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getCategoryContent", null);
__decorate([
    (0, common_1.Get)("universes/page/:id/fragment"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getPageFragment", null);
__decorate([
    (0, common_1.Post)("new"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "createUniverse", null);
__decorate([
    (0, common_1.Post)("content/create"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "createContent", null);
__decorate([
    (0, common_1.Post)("webhook/build-complete"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "handleBuildComplete", null);
__decorate([
    (0, common_1.Get)("job/:jobId/status"),
    __param(0, (0, common_1.Param)("jobId")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)("queue/stats"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getQueueStats", null);
__decorate([
    (0, common_1.Get)("test/langflow"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "testLangflow", null);
__decorate([
    (0, common_1.Get)("api/universes"),
    (0, swagger_1.ApiOperation)({
        summary: "Get all universes",
        description: "Retrieve a list of all universes in the system",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "List of universes retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getUniversesApi", null);
__decorate([
    (0, common_1.Get)("api/universes/:id"),
    (0, swagger_1.ApiOperation)({
        summary: "Get universe by ID",
        description: "Retrieve detailed information about a specific universe",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "Universe identifier",
        example: "u_demo",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Universe details retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Universe not found" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getUniverseApi", null);
__decorate([
    (0, common_1.Get)("api/universes/:id/entities"),
    (0, swagger_1.ApiOperation)({
        summary: "Get universe entities",
        description: "Retrieve all entities (worlds, characters, cultures, technologies) within a universe",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "Universe identifier",
        example: "u_demo",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Universe entities retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getUniverseEntitiesApi", null);
__decorate([
    (0, common_1.Get)("api/entities/:id"),
    (0, swagger_1.ApiOperation)({
        summary: "Get entity by ID",
        description: "Retrieve detailed information about a specific entity (world, character, culture, or technology)",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "Entity identifier",
        example: "ch_captain_reyes",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Entity details retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Entity not found" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getEntityApi", null);
__decorate([
    (0, common_1.Get)("api/characters/:id/relationships"),
    (0, swagger_1.ApiOperation)({
        summary: "Get character relationships",
        description: "Retrieve a character's homeworld and cultural affiliations",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "Character identifier",
        example: "ch_captain_reyes",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Character relationships retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getCharacterRelationshipsApi", null);
__decorate([
    (0, common_1.Get)("api/worlds/:id/inhabitants"),
    (0, swagger_1.ApiOperation)({
        summary: "Get world inhabitants",
        description: "Retrieve all characters and cultures associated with a specific world",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "World identifier",
        example: "w_terra_nova",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "World inhabitants retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getWorldInhabitantsApi", null);
__decorate([
    (0, common_1.Get)("api/cultures/:id/characters"),
    (0, swagger_1.ApiOperation)({
        summary: "Get culture characters",
        description: "Retrieve all characters belonging to a specific culture",
    }),
    (0, swagger_1.ApiParam)({
        name: "id",
        description: "Culture identifier",
        example: "cu_terran_federation",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Culture characters retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getCultureCharactersApi", null);
__decorate([
    (0, common_1.Get)("api/timeline/:universeId"),
    (0, swagger_1.ApiOperation)({
        summary: "Get universe timeline",
        description: "Retrieve chronological timeline of character births and deaths within a universe",
    }),
    (0, swagger_1.ApiParam)({
        name: "universeId",
        description: "Universe identifier",
        example: "u_demo",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Universe timeline retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Param)("universeId")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getUniverseTimelineApi", null);
__decorate([
    (0, common_1.Get)("api/spatial/worlds"),
    (0, swagger_1.ApiOperation)({
        summary: "Get spatial world data",
        description: "Retrieve all worlds with their coordinates and spatial information for mapping",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Spatial world data retrieved successfully",
        type: (universe_dto_1.ApiResponseDto),
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Internal server error" }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "getWorldsSpatialApi", null);
exports.UniversesController = UniversesController = __decorate([
    (0, swagger_1.ApiTags)("universes"),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [universes_service_1.UniversesService,
        langflow_service_1.LangflowService])
], UniversesController);
//# sourceMappingURL=universes.controller.js.map