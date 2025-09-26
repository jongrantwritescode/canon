import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { WorkflowsService } from "../workflows/workflows.service";
import { ApiService } from "../api/api.service";
import { BuildJobData, BuildJobResult } from "./queue.service";

@Injectable()
@Processor("build-queue")
export class QueueProcessor {
  constructor(
    private workflowsService: WorkflowsService,
    @Inject(forwardRef(() => ApiService))
    private universesService: ApiService
  ) {}

  @Process("build")
  async handleBuildJob(job: Job<BuildJobData>): Promise<BuildJobResult> {
    const { jobId, type, universeId } = job.data;

    try {
      console.log(`Processing build job ${jobId} of type ${type}`);

      let result: any;

      switch (type) {
        case "world":
          result = await this.workflowsService.generateWorld(universeId);
          break;
        case "character":
          result = await this.workflowsService.generateCharacter(universeId);
          break;
        case "culture":
          result = await this.workflowsService.generateCulture(universeId);
          break;
        case "technology":
          result = await this.workflowsService.generateTechnology(universeId);
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
    let name = `New ${type}`;

    // Try to parse as JSON first (for mock data)
    try {
      const jsonData = JSON.parse(markdown);
      if (jsonData.name) {
        name = jsonData.name;
      }
    } catch (e) {
      // If not JSON, try to extract name from markdown (first # heading)
      const nameMatch = markdown.match(/^#\s+(.+)$/m);
      if (nameMatch) {
        name = nameMatch[1];
      }
    }

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
      type:
        type === "world"
          ? "Worlds"
          : type.charAt(0).toUpperCase() + type.slice(1) + "s",
      createdAt: new Date().toISOString(),
      universeId: universeId,
    };
  }
}
