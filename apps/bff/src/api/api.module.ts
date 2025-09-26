import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller";
import { ApiService } from "./api.service";
import { GraphModule } from "../graph/graph.module";
import { WorkflowsModule } from "../workflows/workflows.module";
import { QueueModule } from "../queue/queue.module";
import { MarkdownService } from "../common/markdown.service";

@Module({
  imports: [GraphModule, WorkflowsModule, QueueModule],
  controllers: [ApiController],
  providers: [ApiService, MarkdownService],
  exports: [ApiService],
})
export class ApiModule {}
