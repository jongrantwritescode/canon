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
const universes_service_1 = require("./universes.service");
const langflow_service_1 = require("../builder/langflow.service");
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
          <ul>
            <li><a href="/universes">GET /universes</a> - List all universes</li>
            <li><a href="/universes/u_demo">GET /universes/:id</a> - Get universe details</li>
            <li>POST /universes/new - Create new universe</li>
            <li>POST /universes/content/create - Create new content</li>
          </ul>
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
    async createUniverse(res) {
        try {
            const universe = await this.universesService.createNewUniverse();
            const html = this.universesService.renderUniverseCreated(universe);
            res.setHeader("Content-Type", "text/html");
            res.send(html);
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
            const { universeId, type, prompt } = body;
            const content = await this.universesService.createContent(universeId, type, prompt);
            const html = this.universesService.renderContentCreated(content);
            res.setHeader("Content-Type", "text/html");
            res.send(html);
        }
        catch (error) {
            console.error("Error creating content:", error);
            res.status(500).send('<div class="error">Failed to create content</div>');
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
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
    (0, common_1.Get)("test/langflow"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UniversesController.prototype, "testLangflow", null);
exports.UniversesController = UniversesController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [universes_service_1.UniversesService,
        langflow_service_1.LangflowService])
], UniversesController);
//# sourceMappingURL=universes.controller.js.map