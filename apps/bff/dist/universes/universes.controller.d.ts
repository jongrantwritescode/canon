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
    createUniverse(res: Response): Promise<void>;
    createContent(body: any, res: Response): Promise<void>;
    testLangflow(res: Response): Promise<void>;
}
