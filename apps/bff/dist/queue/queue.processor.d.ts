import { Job } from "bull";
import { LangflowService } from "../builder/langflow.service";
import { BuildJobData, BuildJobResult } from "./queue.service";
export declare class QueueProcessor {
    private langflowService;
    constructor(langflowService: LangflowService);
    handleBuildJob(job: Job<BuildJobData>): Promise<BuildJobResult>;
    private callWebhook;
}
