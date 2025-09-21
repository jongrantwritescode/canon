import { Queue } from "bull";
import { ConfigService } from "@nestjs/config";
export interface BuildJobData {
    jobId: string;
    type: "world" | "character" | "culture" | "technology";
    universeId?: string;
    createdAt: string;
}
export interface BuildJobResult {
    jobId: string;
    success: boolean;
    data?: any;
    error?: string;
}
export declare class QueueService {
    private buildQueue;
    private configService;
    constructor(buildQueue: Queue, configService: ConfigService);
    addBuildJob(jobData: Omit<BuildJobData, "jobId" | "createdAt">): Promise<string>;
    getJobStatus(jobId: string): Promise<any>;
    getQueueStats(): Promise<any>;
    processNextJob(): Promise<void>;
}
