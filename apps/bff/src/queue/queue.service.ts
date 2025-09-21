import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue, Job } from "bull";
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

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue("build-queue") private buildQueue: Queue,
    private configService: ConfigService
  ) {}

  async addBuildJob(
    jobData: Omit<BuildJobData, "jobId" | "createdAt">
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullJobData: BuildJobData = {
      ...jobData,
      jobId,
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

  async getJobStatus(jobId: string): Promise<any> {
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

  async getQueueStats(): Promise<any> {
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

  async processNextJob(): Promise<void> {
    // This will be called by the webhook to process the next job
    // Bull automatically processes jobs, but we can trigger additional processing
    const waitingJobs = await this.buildQueue.getWaiting();
    if (waitingJobs.length > 0) {
      console.log(`Processing next job: ${waitingJobs[0].data.jobId}`);
    }
  }
}
