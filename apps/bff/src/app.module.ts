import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiModule } from "./api/api.module";
import { GraphModule } from "./graph/graph.module";
import { WorkflowsModule } from "./workflows/workflows.module";
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    QueueModule,
    ApiModule,
    GraphModule,
    WorkflowsModule,
  ],
})
export class AppModule {}
