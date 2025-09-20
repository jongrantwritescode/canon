import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BuilderService } from "./builder.service";
import { LangflowService } from "./langflow.service";

@Module({
  imports: [ConfigModule],
  providers: [BuilderService, LangflowService],
  exports: [BuilderService, LangflowService],
})
export class BuilderModule {}
