import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { LangflowService } from "../builder/langflow.service";
import { UniversesService } from "../universes/universes.service";
import { BuildJobData, BuildJobResult } from "./queue.service";

@Injectable()
@Processor("build-queue")
export class QueueProcessor {
  constructor(
    private langflowService: LangflowService,
    @Inject(forwardRef(() => UniversesService))
    private universesService: UniversesService
  ) {}

  @Process("build")
  async handleBuildJob(job: Job<BuildJobData>): Promise<BuildJobResult> {
    const { jobId, type, universeId } = job.data;

    try {
      console.log(`Processing build job ${jobId} of type ${type}`);

      let result: any;

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

      // Process the result directly and write to database
      await this.processResult(jobId, type, universeId, result);

      return {
        jobId,
        success: true,
        data: result,
      };
    } catch (error) {
      console.error(`Build job ${jobId} failed:`, error);

      return {
        jobId,
        success: false,
        error: error.message,
      };
    }
  }

  private async processResult(
    jobId: string,
    type: string,
    universeId: string,
    result: any
  ): Promise<void> {
    try {
      console.log(`Processing result for job ${jobId} of type ${type}`);

      // Extract entity data from markdown result
      const entityData = this.extractEntityData(result, type, universeId);

      // Write to database via GraphService
      const page = await this.universesService.createPage(entityData);
      console.log(`${type} created: ${page.id}`);

      // Process next job in queue
      await this.universesService.processNextJob();
    } catch (error) {
      console.error(`Error processing result for job ${jobId}:`, error);
      throw error;
    }
  }

  private extractEntityData(
    markdown: string,
    type: string,
    universeId: string
  ): any {
    // Extract name from markdown (first # heading)
    const nameMatch = markdown.match(/^#\s+(.+)$/m);
    const name = nameMatch ? nameMatch[1] : `New ${type}`;

    const prefix =
      type === "world"
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
      type: type.charAt(0).toUpperCase() + type.slice(1),
      createdAt: new Date().toISOString(),
      universeId: universeId,
    };
  }
}
