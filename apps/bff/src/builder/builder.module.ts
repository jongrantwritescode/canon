import { Module } from "@nestjs/common";
import { BuilderService } from "./builder.service";
import { LangflowService } from "./langflow.service";

@Module({
  providers: [BuilderService, LangflowService],
  exports: [BuilderService, LangflowService],
})
export class BuilderModule {}
