import { Module, forwardRef } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { QueueService } from "./queue.service";
import { QueueProcessor } from "./queue.processor";
import { WorkflowsModule } from "../workflows/workflows.module";
import { ApiModule } from "../api/api.module";

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>("REDIS_HOST", "localhost"),
          port: configService.get<number>("REDIS_PORT", 6379),
          password: configService.get<string>("REDIS_PASSWORD"),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: "build-queue",
    }),
    WorkflowsModule,
    forwardRef(() => ApiModule),
  ],
  providers: [QueueService, QueueProcessor],
  exports: [QueueService],
})
export class QueueModule {}
