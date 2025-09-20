import { Response } from "express";
import { UniversesService } from "./universes.service";
import { LangflowService } from "../builder/langflow.service";
export declare class UniversesController {
    private readonly universesService;
    private readonly langflowService;
    constructor(universesService: UniversesService, langflowService: LangflowService);
    getRoot(res: Response): Promise<void>;
    getUniversesList(res: Response): Promise<void>;
    getUniverse(id: string, res: Response): Promise<void>;
    getCategoryContent(id: string, category: string, res: Response): Promise<void>;
    getPageFragment(id: string, res: Response): Promise<void>;
    createUniverse(body: any, res: Response): Promise<void>;
    createContent(body: any, res: Response): Promise<void>;
    handleBuildComplete(body: any, res: Response): Promise<void>;
    getJobStatus(jobId: string, res: Response): Promise<void>;
    getQueueStats(res: Response): Promise<void>;
    testLangflow(res: Response): Promise<void>;
    getUniversesApi(res: Response): Promise<void>;
    getUniverseApi(id: string, res: Response): Promise<void>;
    getUniverseEntitiesApi(id: string, res: Response): Promise<void>;
    getEntityApi(id: string, res: Response): Promise<void>;
    getCharacterRelationshipsApi(id: string, res: Response): Promise<void>;
    getWorldInhabitantsApi(id: string, res: Response): Promise<void>;
    getCultureCharactersApi(id: string, res: Response): Promise<void>;
    getUniverseTimelineApi(universeId: string, res: Response): Promise<void>;
    getWorldsSpatialApi(res: Response): Promise<void>;
}
