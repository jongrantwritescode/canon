import { Module } from "@nestjs/common";
import { UniversesController } from "./universes.controller";
import { UniversesService } from "./universes.service";
import { GraphModule } from "../graph/graph.module";
import { BuilderModule } from "../builder/builder.module";
import { QueueModule } from "../queue/queue.module";
import { MarkdownService } from "../common/markdown.service";

@Module({
  imports: [GraphModule, BuilderModule, QueueModule],
  controllers: [UniversesController],
  providers: [UniversesService, MarkdownService],
})
export class UniversesModule {}
