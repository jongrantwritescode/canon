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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
let QueueService = class QueueService {
    constructor(buildQueue, configService) {
        this.buildQueue = buildQueue;
        this.configService = configService;
    }
    async addBuildJob(jobData) {
        const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const webhookUrl = this.configService.get("WEBHOOK_BASE_URL", "http://localhost:3000");
        const fullJobData = {
            ...jobData,
            jobId,
            webhookUrl: `${webhookUrl}/webhook/build-complete`,
            createdAt: new Date().toISOString(),
        };
        const job = await this.buildQueue.add("build", fullJobData, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
        return jobId;
    }
    async getJobStatus(jobId) {
        const jobs = await this.buildQueue.getJobs([
            "waiting",
            "active",
            "completed",
            "failed",
        ]);
        const job = jobs.find((j) => j.data.jobId === jobId);
        if (!job) {
            return null;
        }
        return {
            jobId: job.data.jobId,
            status: await job.getState(),
            progress: job.progress(),
            data: job.data,
            result: job.returnvalue,
            error: job.failedReason,
            createdAt: job.timestamp,
            processedAt: job.processedOn,
            finishedAt: job.finishedOn,
        };
    }
    async getQueueStats() {
        const waiting = await this.buildQueue.getWaiting();
        const active = await this.buildQueue.getActive();
        const completed = await this.buildQueue.getCompleted();
        const failed = await this.buildQueue.getFailed();
        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            total: waiting.length + active.length + completed.length + failed.length,
        };
    }
    async processNextJob() {
        const waitingJobs = await this.buildQueue.getWaiting();
        if (waitingJobs.length > 0) {
            console.log(`Processing next job: ${waitingJobs[0].data.jobId}`);
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)("build-queue")),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map