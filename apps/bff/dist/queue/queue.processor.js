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
exports.QueueProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const langflow_service_1 = require("../builder/langflow.service");
const universes_service_1 = require("../universes/universes.service");
let QueueProcessor = class QueueProcessor {
    constructor(langflowService, universesService) {
        this.langflowService = langflowService;
        this.universesService = universesService;
    }
    async handleBuildJob(job) {
        const { jobId, type, universeId } = job.data;
        try {
            console.log(`Processing build job ${jobId} of type ${type}`);
            let result;
            switch (type) {
                case "world":
                    result = await this.langflowService.generateWorld(universeId);
                    break;
                case "character":
                    result = await this.langflowService.generateCharacter(universeId);
                    break;
                case "culture":
                    result = await this.langflowService.generateCulture(universeId);
                    break;
                case "technology":
                    result = await this.langflowService.generateTechnology(universeId);
                    break;
                default:
                    throw new Error(`Unknown build type: ${type}`);
            }
            await this.processResult(jobId, type, universeId, result);
            return {
                jobId,
                success: true,
                data: result,
            };
        }
        catch (error) {
            console.error(`Build job ${jobId} failed:`, error);
            return {
                jobId,
                success: false,
                error: error.message,
            };
        }
    }
    async processResult(jobId, type, universeId, result) {
        try {
            console.log(`Processing result for job ${jobId} of type ${type}`);
            const entityData = this.extractEntityData(result, type, universeId);
            const page = await this.universesService.createPage(entityData);
            console.log(`${type} created: ${page.id}`);
            await this.universesService.processNextJob();
        }
        catch (error) {
            console.error(`Error processing result for job ${jobId}:`, error);
            throw error;
        }
    }
    extractEntityData(markdown, type, universeId) {
        let name = `New ${type}`;
        try {
            const jsonData = JSON.parse(markdown);
            if (jsonData.name) {
                name = jsonData.name;
            }
        }
        catch (e) {
            const nameMatch = markdown.match(/^#\s+(.+)$/m);
            if (nameMatch) {
                name = nameMatch[1];
            }
        }
        const prefix = type === "world"
            ? "w_"
            : type === "character"
                ? "ch_"
                : type === "culture"
                    ? "cu_"
                    : "t_";
        const entityId = `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`;
        return {
            id: entityId,
            name: name,
            title: name,
            markdown: markdown,
            type: type === "world"
                ? "Worlds"
                : type.charAt(0).toUpperCase() + type.slice(1) + "s",
            createdAt: new Date().toISOString(),
            universeId: universeId,
        };
    }
};
exports.QueueProcessor = QueueProcessor;
__decorate([
    (0, bull_1.Process)("build"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QueueProcessor.prototype, "handleBuildJob", null);
exports.QueueProcessor = QueueProcessor = __decorate([
    (0, common_1.Injectable)(),
    (0, bull_1.Processor)("build-queue"),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => universes_service_1.UniversesService))),
    __metadata("design:paramtypes", [langflow_service_1.LangflowService,
        universes_service_1.UniversesService])
], QueueProcessor);
//# sourceMappingURL=queue.processor.js.map