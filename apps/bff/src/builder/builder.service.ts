import { Injectable } from "@nestjs/common";
import { LangflowService } from "./langflow.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class BuilderService {
  constructor(private langflowService: LangflowService) {}

  async generateUniverse(prompt?: string): Promise<any> {
    try {
      const universeId = `u_${uuidv4().replace(/-/g, "").substring(0, 8)}`;
      const sessionId = `universe_${universeId}`;

      const markdown = await this.langflowService.generateUniverse(
        prompt ||
          "Create a new universe with diverse worlds, interesting characters, unique cultures, and advanced technologies",
        sessionId
      );

      // Extract name from markdown (first # heading)
      const nameMatch = markdown.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1] : "New Universe";

      return {
        id: universeId,
        name: name,
        title: name,
        markdown: markdown,
        type: "Universe",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating universe:", error);
      throw new Error("Failed to generate universe");
    }
  }

  async generateWorld(universeId: string, prompt?: string): Promise<any> {
    try {
      const worldId = `w_${uuidv4().replace(/-/g, "").substring(0, 8)}`;
      const sessionId = `world_${worldId}`;

      const markdown = await this.langflowService.generateWorld(
        prompt || "Create a new world for this universe",
        universeId,
        sessionId
      );

      // Extract name from markdown (first # heading)
      const nameMatch = markdown.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1] : "New World";

      return {
        id: worldId,
        name: name,
        title: name,
        markdown: markdown,
        type: "World",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating world:", error);
      throw new Error("Failed to generate world");
    }
  }

  async generateCharacter(universeId: string, prompt?: string): Promise<any> {
    try {
      const characterId = `ch_${uuidv4().replace(/-/g, "").substring(0, 8)}`;
      const sessionId = `character_${characterId}`;

      const markdown = await this.langflowService.generateCharacter(
        prompt || "Create a new character for this universe",
        universeId,
        sessionId
      );

      // Extract name from markdown (first # heading)
      const nameMatch = markdown.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1] : "New Character";

      return {
        id: characterId,
        name: name,
        title: name,
        markdown: markdown,
        type: "Character",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating character:", error);
      throw new Error("Failed to generate character");
    }
  }

  async generateCulture(universeId: string, prompt?: string): Promise<any> {
    try {
      const cultureId = `cu_${uuidv4().replace(/-/g, "").substring(0, 8)}`;
      const sessionId = `culture_${cultureId}`;

      const markdown = await this.langflowService.generateCulture(
        prompt || "Create a new culture for this universe",
        universeId,
        sessionId
      );

      // Extract name from markdown (first # heading)
      const nameMatch = markdown.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1] : "New Culture";

      return {
        id: cultureId,
        name: name,
        title: name,
        markdown: markdown,
        type: "Culture",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating culture:", error);
      throw new Error("Failed to generate culture");
    }
  }

  async generateTechnology(universeId: string, prompt?: string): Promise<any> {
    try {
      const techId = `t_${uuidv4().replace(/-/g, "").substring(0, 8)}`;
      const sessionId = `technology_${techId}`;

      const markdown = await this.langflowService.generateTechnology(
        prompt || "Create a new technology for this universe",
        universeId,
        sessionId
      );

      // Extract name from markdown (first # heading)
      const nameMatch = markdown.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1] : "New Technology";

      return {
        id: techId,
        name: name,
        title: name,
        markdown: markdown,
        type: "Technology",
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating technology:", error);
      throw new Error("Failed to generate technology");
    }
  }
}
