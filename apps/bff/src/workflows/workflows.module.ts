import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WorkflowsService } from "./workflows.service";

@Module({
  imports: [ConfigModule],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
