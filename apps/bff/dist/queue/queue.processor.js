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
exports.QueueProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const langflow_service_1 = require("../builder/langflow.service");
const axios_1 = require("axios");
let QueueProcessor = class QueueProcessor {
    constructor(langflowService) {
        this.langflowService = langflowService;
    }
    async handleBuildJob(job) {
        const { jobId, type, universeId, webhookUrl } = job.data;
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
            await this.callWebhook(webhookUrl, {
                jobId,
                success: true,
                data: {
                    type,
                    universeId,
                    result,
                },
            });
            return {
                jobId,
                success: true,
                data: result,
            };
        }
        catch (error) {
            console.error(`Build job ${jobId} failed:`, error);
            await this.callWebhook(webhookUrl, {
                jobId,
                success: false,
                error: error.message,
            });
            return {
                jobId,
                success: false,
                error: error.message,
            };
        }
    }
    async callWebhook(webhookUrl, data) {
        try {
            await axios_1.default.post(webhookUrl, data, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });
            console.log(`Webhook called successfully for job ${data.jobId}`);
        }
        catch (error) {
            console.error(`Failed to call webhook for job ${data.jobId}:`, error.message);
        }
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
    __metadata("design:paramtypes", [langflow_service_1.LangflowService])
], QueueProcessor);
//# sourceMappingURL=queue.processor.js.map