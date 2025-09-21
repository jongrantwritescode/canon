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
      <!DOCTYPE html>
      <html>
      <head>
        <title>Canon BFF API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .api-section { margin: 20px 0; }
          .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #007acc; border-radius: 4px; }
          .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
          .get { background: #28a745; color: white; }
          .post { background: #007bff; color: white; }
          .put { background: #ffc107; color: black; }
          .delete { background: #dc3545; color: white; }
          .path { font-family: monospace; font-size: 16px; }
          .description { color: #666; margin-top: 5px; }
          .swagger-link { background: #007acc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .swagger-link:hover { background: #005a9e; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Canon BFF API</h1>
          <p>Backend for Frontend API for the Canon Universe Builder</p>
          
          <a href="/api/docs" class="swagger-link">📚 View Interactive API Documentation (Swagger)</a>

          <div class="api-section">
            <h2>🌐 Frontend Routes</h2>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/universes</span>
              <div class="description">List all universes (HTML view)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/universes/:id</span>
              <div class="description">View specific universe (HTML view)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/universes/:id/category/:category</span>
              <div class="description">View universe category content (HTML view)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/universes/page/:id/fragment</span>
              <div class="description">Get page fragment (HTML view)</div>
            </div>
          </div>

          <div class="api-section">
            <h2>🔧 Content Management</h2>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span class="path">/new</span>
              <div class="description">Create a new universe</div>
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span class="path">/content/create</span>
              <div class="description">Create new content (worlds, characters, etc.)</div>
            </div>
            <div class="endpoint">
              <span class="method post">POST</span>
              <span class="path">/webhook/build-complete</span>
              <div class="description">Webhook for build completion notifications</div>
            </div>
          </div>

          <div class="api-section">
            <h2>📊 System Status</h2>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/job/:jobId/status</span>
              <div class="description">Check job status</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/queue/stats</span>
              <div class="description">Get queue statistics</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/test/langflow</span>
              <div class="description">Test Langflow connection</div>
            </div>
          </div>

          <div class="api-section">
            <h2>🔌 JSON API Endpoints</h2>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/universes</span>
              <div class="description">Get all universes (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/universes/:id</span>
              <div class="description">Get universe by ID (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/universes/:id/entities</span>
              <div class="description">Get all entities in universe (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/entities/:id</span>
              <div class="description">Get entity by ID (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/characters/:id/relationships</span>
              <div class="description">Get character relationships (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/worlds/:id/inhabitants</span>
              <div class="description">Get world inhabitants (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/cultures/:id/characters</span>
              <div class="description">Get culture characters (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/timeline/:universeId</span>
              <div class="description">Get universe timeline (JSON)</div>
            </div>
            <div class="endpoint">
              <span class="method get">GET</span>
              <span class="path">/api/spatial/worlds</span>
              <div class="description">Get spatial world data (JSON)</div>
            </div>
          </div>

          <div class="api-section">
            <h2>🎯 Frontend Integration</h2>
            <p>The frontend application runs on port 8080 and communicates with this BFF API.</p>
            <p>All API endpoints are available for programmatic access, while HTML routes provide user-friendly views.</p>
          </div>
        </div>
      </body>
      </html>
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
            res.status(201).json({
                status: result.status,
                message: result.message,
                universe: result.universe,
                jobId: null,
            });
        }
        catch (error) {
            console.error("Error creating universe:", error);
            res.status(500).json({
                status: "error",
                message: "Failed to create universe",
            });
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