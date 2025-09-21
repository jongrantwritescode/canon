import { Job } from "bull";
import { LangflowService } from "../builder/langflow.service";
import { UniversesService } from "../universes/universes.service";
import { BuildJobData, BuildJobResult } from "./queue.service";
export declare class QueueProcessor {
    private langflowService;
    private universesService;
    constructor(langflowService: LangflowService, universesService: UniversesService);
    handleBuildJob(job: Job<BuildJobData>): Promise<BuildJobResult>;
    private processResult;
    private extractEntityData;
}
