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
exports.SpatialWorldDto = exports.TimelineEventDto = exports.CharacterRelationshipDto = exports.ApiResponseDto = exports.EntityDto = exports.TechnologyDto = exports.CultureDto = exports.CharacterDto = exports.WorldDto = exports.UniverseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UniverseDto {
}
exports.UniverseDto = UniverseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Unique universe identifier", example: "u_demo" }),
    __metadata("design:type", String)
], UniverseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Universe name", example: "Aetheria Prime" }),
    __metadata("design:type", String)
], UniverseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Universe description",
        example: "A vast galaxy-spanning civilization",
    }),
    __metadata("design:type", String)
], UniverseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Creation timestamp", example: 1704067200000 }),
    __metadata("design:type", Number)
], UniverseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Available categories",
        example: ["Worlds", "Characters", "Cultures", "Technologies"],
    }),
    __metadata("design:type", Array)
], UniverseDto.prototype, "categories", void 0);
class WorldDto {
}
exports.WorldDto = WorldDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique world identifier",
        example: "w_terra_nova",
    }),
    __metadata("design:type", String)
], WorldDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "World name", example: "Terra Nova" }),
    __metadata("design:type", String)
], WorldDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "World type", example: "Terrestrial" }),
    __metadata("design:type", String)
], WorldDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Climate type", example: "Temperate" }),
    __metadata("design:type", String)
], WorldDto.prototype, "climate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Atmosphere type", example: "Breathable" }),
    __metadata("design:type", String)
], WorldDto.prototype, "atmosphere", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Gravity level", example: "1.2g" }),
    __metadata("design:type", String)
], WorldDto.prototype, "gravity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "X coordinate (0-1000)", example: 450 }),
    __metadata("design:type", Number)
], WorldDto.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Y coordinate (0-1000)", example: 320 }),
    __metadata("design:type", Number)
], WorldDto.prototype, "y", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Plant life description",
        example: "Dense forests of blue-leafed trees",
    }),
    __metadata("design:type", String)
], WorldDto.prototype, "flora", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Animal life description",
        example: "Sky whales, crystal deer",
    }),
    __metadata("design:type", String)
], WorldDto.prototype, "fauna", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Full content in markdown",
        example: "# Terra Nova\n\nA lush, Earth-like world...",
    }),
    __metadata("design:type", String)
], WorldDto.prototype, "markdown", void 0);
class CharacterDto {
}
exports.CharacterDto = CharacterDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique character identifier",
        example: "ch_captain_reyes",
    }),
    __metadata("design:type", String)
], CharacterDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Character name",
        example: "Captain Elena Reyes",
    }),
    __metadata("design:type", String)
], CharacterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Species", example: "Human" }),
    __metadata("design:type", String)
], CharacterDto.prototype, "species", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Character role", example: "Starship Captain" }),
    __metadata("design:type", String)
], CharacterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Homeworld name", example: "Terra Nova" }),
    __metadata("design:type", String)
], CharacterDto.prototype, "homeworld", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Birth year (universe calendar)", example: 1247 }),
    __metadata("design:type", Number)
], CharacterDto.prototype, "birthdate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Death year (universe calendar)", example: 1305 }),
    __metadata("design:type", Number)
], CharacterDto.prototype, "deathDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Life events timeline",
        example: "1247: Born on Terra Nova | 1265: Graduated Academy",
    }),
    __metadata("design:type", String)
], CharacterDto.prototype, "lifeEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Full content in markdown",
        example: "# Captain Elena Reyes\n\nA seasoned starship captain...",
    }),
    __metadata("design:type", String)
], CharacterDto.prototype, "markdown", void 0);
class CultureDto {
}
exports.CultureDto = CultureDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique culture identifier",
        example: "cu_terran_federation",
    }),
    __metadata("design:type", String)
], CultureDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Culture name", example: "Terran Federation" }),
    __metadata("design:type", String)
], CultureDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Primary species", example: "Human" }),
    __metadata("design:type", String)
], CultureDto.prototype, "species", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Government type",
        example: "Democratic Republic",
    }),
    __metadata("design:type", String)
], CultureDto.prototype, "government", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Technology level", example: "Advanced" }),
    __metadata("design:type", String)
], CultureDto.prototype, "technologyLevel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Full content in markdown",
        example: "# Terran Federation\n\nA democratic society...",
    }),
    __metadata("design:type", String)
], CultureDto.prototype, "markdown", void 0);
class TechnologyDto {
}
exports.TechnologyDto = TechnologyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique technology identifier",
        example: "t_ftl_drive",
    }),
    __metadata("design:type", String)
], TechnologyDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Technology name", example: "Quantum FTL Drive" }),
    __metadata("design:type", String)
], TechnologyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Technology type", example: "Propulsion" }),
    __metadata("design:type", String)
], TechnologyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Technology level", example: "Revolutionary" }),
    __metadata("design:type", String)
], TechnologyDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Full content in markdown",
        example: "# Quantum FTL Drive\n\nA revolutionary propulsion system...",
    }),
    __metadata("design:type", String)
], TechnologyDto.prototype, "markdown", void 0);
class EntityDto {
}
exports.EntityDto = EntityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Unique entity identifier",
        example: "w_terra_nova",
    }),
    __metadata("design:type", String)
], EntityDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Entity name", example: "Terra Nova" }),
    __metadata("design:type", String)
], EntityDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Entity title", example: "Terra Nova" }),
    __metadata("design:type", String)
], EntityDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Full content in markdown",
        example: "# Terra Nova\n\nA lush, Earth-like world...",
    }),
    __metadata("design:type", String)
], EntityDto.prototype, "markdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Entity labels", example: ["World"] }),
    __metadata("design:type", Array)
], EntityDto.prototype, "labels", void 0);
class ApiResponseDto {
}
exports.ApiResponseDto = ApiResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Success status", example: true }),
    __metadata("design:type", Boolean)
], ApiResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Response data" }),
    __metadata("design:type", Object)
], ApiResponseDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Error message (if any)",
        example: "Not found",
        required: false,
    }),
    __metadata("design:type", String)
], ApiResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Count of items (for lists)",
        example: 5,
        required: false,
    }),
    __metadata("design:type", Number)
], ApiResponseDto.prototype, "count", void 0);
class CharacterRelationshipDto {
}
exports.CharacterRelationshipDto = CharacterRelationshipDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Character ID", example: "ch_captain_reyes" }),
    __metadata("design:type", String)
], CharacterRelationshipDto.prototype, "characterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Character name",
        example: "Captain Elena Reyes",
    }),
    __metadata("design:type", String)
], CharacterRelationshipDto.prototype, "characterName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Homeworld ID",
        example: "w_terra_nova",
        required: false,
    }),
    __metadata("design:type", String)
], CharacterRelationshipDto.prototype, "homeworldId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Homeworld name",
        example: "Terra Nova",
        required: false,
    }),
    __metadata("design:type", String)
], CharacterRelationshipDto.prototype, "homeworldName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Culture ID",
        example: "cu_terran_federation",
        required: false,
    }),
    __metadata("design:type", String)
], CharacterRelationshipDto.prototype, "cultureId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Culture name",
        example: "Terran Federation",
        required: false,
    }),
    __metadata("design:type", String)
], CharacterRelationshipDto.prototype, "cultureName", void 0);
class TimelineEventDto {
}
exports.TimelineEventDto = TimelineEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Event year (universe calendar)", example: 1247 }),
    __metadata("design:type", Number)
], TimelineEventDto.prototype, "eventYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Event type",
        example: "birth",
        enum: ["birth", "death"],
    }),
    __metadata("design:type", String)
], TimelineEventDto.prototype, "eventType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Character name",
        example: "Captain Elena Reyes",
    }),
    __metadata("design:type", String)
], TimelineEventDto.prototype, "eventName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Character ID", example: "ch_captain_reyes" }),
    __metadata("design:type", String)
], TimelineEventDto.prototype, "characterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Character species", example: "Human" }),
    __metadata("design:type", String)
], TimelineEventDto.prototype, "species", void 0);
class SpatialWorldDto {
}
exports.SpatialWorldDto = SpatialWorldDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "World ID", example: "w_terra_nova" }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "World name", example: "Terra Nova" }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "World type", example: "Terrestrial" }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "X coordinate", example: 450 }),
    __metadata("design:type", Number)
], SpatialWorldDto.prototype, "x", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Y coordinate", example: 320 }),
    __metadata("design:type", Number)
], SpatialWorldDto.prototype, "y", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Climate", example: "Temperate" }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "climate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Atmosphere", example: "Breathable" }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "atmosphere", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Gravity", example: "1.2g" }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "gravity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Flora description",
        example: "Dense forests of blue-leafed trees",
    }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "flora", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Fauna description",
        example: "Sky whales, crystal deer",
    }),
    __metadata("design:type", String)
], SpatialWorldDto.prototype, "fauna", void 0);
//# sourceMappingURL=universe.dto.js.map