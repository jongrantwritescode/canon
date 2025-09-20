import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LangflowService } from "./langflow.service";

@Module({
  imports: [ConfigModule],
  providers: [LangflowService],
  exports: [LangflowService],
})
export class BuilderModule {}
