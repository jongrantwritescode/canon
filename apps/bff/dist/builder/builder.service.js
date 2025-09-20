"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderService = void 0;
const common_1 = require("@nestjs/common");
const langflow_service_1 = require("./langflow.service");
const uuid_1 = require("uuid");
let BuilderService = class BuilderService {
    constructor(langflowService) {
        this.langflowService = langflowService;
    }
    async generateUniverse(prompt) {
        try {
            const universeId = `u_${(0, uuid_1.v4)().replace(/-/g, "").substring(0, 8)}`;
            const sessionId = `universe_${universeId}`;
            const markdown = await this.langflowService.generateUniverse(prompt ||
                "Create a new universe with diverse worlds, interesting characters, unique cultures, and advanced technologies", sessionId);
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
        }
        catch (error) {
            console.error("Error generating universe:", error);
            throw new Error("Failed to generate universe");
        }
    }
    async generateWorld(universeId, prompt) {
        try {
            const worldId = `w_${(0, uuid_1.v4)().replace(/-/g, "").substring(0, 8)}`;
            const sessionId = `world_${worldId}`;
            const markdown = await this.langflowService.generateWorld(prompt || "Create a new world for this universe", universeId, sessionId);
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
        }
        catch (error) {
            console.error("Error generating world:", error);
            throw new Error("Failed to generate world");
        }
    }
    async generateCharacter(universeId, prompt) {
        try {
            const characterId = `ch_${(0, uuid_1.v4)().replace(/-/g, "").substring(0, 8)}`;
            const sessionId = `character_${characterId}`;
            const markdown = await this.langflowService.generateCharacter(prompt || "Create a new character for this universe", universeId, sessionId);
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
        }
        catch (error) {
            console.error("Error generating character:", error);
            throw new Error("Failed to generate character");
        }
    }
    async generateCulture(universeId, prompt) {
        try {
            const cultureId = `cu_${(0, uuid_1.v4)().replace(/-/g, "").substring(0, 8)}`;
            const sessionId = `culture_${cultureId}`;
            const markdown = await this.langflowService.generateCulture(prompt || "Create a new culture for this universe", universeId, sessionId);
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
        }
        catch (error) {
            console.error("Error generating culture:", error);
            throw new Error("Failed to generate culture");
        }
    }
    async generateTechnology(universeId, prompt) {
        try {
            const techId = `t_${(0, uuid_1.v4)().replace(/-/g, "").substring(0, 8)}`;
            const sessionId = `technology_${techId}`;
            const markdown = await this.langflowService.generateTechnology(prompt || "Create a new technology for this universe", universeId, sessionId);
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
        }
        catch (error) {
            console.error("Error generating technology:", error);
            throw new Error("Failed to generate technology");
        }
    }
};
exports.BuilderService = BuilderService;
exports.BuilderService = BuilderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [langflow_service_1.LangflowService])
], BuilderService);
//# sourceMappingURL=builder.service.js.map