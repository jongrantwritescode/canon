import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UniversesModule } from "./universes/universes.module";
import { GraphModule } from "./graph/graph.module";
import { BuilderModule } from "./builder/builder.module";
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    QueueModule,
    UniversesModule,
    GraphModule,
    BuilderModule,
  ],
})
export class AppModule {}
