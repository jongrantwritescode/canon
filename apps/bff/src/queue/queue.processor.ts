import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable } from "@nestjs/common";
import { LangflowService } from "../builder/langflow.service";
import { BuildJobData, BuildJobResult } from "./queue.service";
import axios from "axios";

@Injectable()
@Processor("build-queue")
export class QueueProcessor {
  constructor(private langflowService: LangflowService) {}

  @Process("build")
  async handleBuildJob(job: Job<BuildJobData>): Promise<BuildJobResult> {
    const { jobId, type, universeId, webhookUrl } = job.data;

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

      // Call webhook to notify BFF that job is complete
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
    } catch (error) {
      console.error(`Build job ${jobId} failed:`, error);

      // Call webhook with error
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

  private async callWebhook(webhookUrl: string, data: any): Promise<void> {
    try {
      await axios.post(webhookUrl, data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });
      console.log(`Webhook called successfully for job ${data.jobId}`);
    } catch (error) {
      console.error(
        `Failed to call webhook for job ${data.jobId}:`,
        error.message
      );
      // Don't throw here - we don't want webhook failures to fail the job
    }
  }
}
