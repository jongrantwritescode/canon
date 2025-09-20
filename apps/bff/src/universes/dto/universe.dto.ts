import { ApiProperty } from "@nestjs/swagger";

export class UniverseDto {
  @ApiProperty({ description: "Unique universe identifier", example: "u_demo" })
  id: string;

  @ApiProperty({ description: "Universe name", example: "Aetheria Prime" })
  name: string;

  @ApiProperty({
    description: "Universe description",
    example: "A vast galaxy-spanning civilization",
  })
  description: string;

  @ApiProperty({ description: "Creation timestamp", example: 1704067200000 })
  createdAt: number;

  @ApiProperty({
    description: "Available categories",
    example: ["Worlds", "Characters", "Cultures", "Technologies"],
  })
  categories?: string[];
}

export class WorldDto {
  @ApiProperty({
    description: "Unique world identifier",
    example: "w_terra_nova",
  })
  id: string;

  @ApiProperty({ description: "World name", example: "Terra Nova" })
  name: string;

  @ApiProperty({ description: "World type", example: "Terrestrial" })
  type: string;

  @ApiProperty({ description: "Climate type", example: "Temperate" })
  climate: string;

  @ApiProperty({ description: "Atmosphere type", example: "Breathable" })
  atmosphere: string;

  @ApiProperty({ description: "Gravity level", example: "1.2g" })
  gravity: string;

  @ApiProperty({ description: "X coordinate (0-1000)", example: 450 })
  x: number;

  @ApiProperty({ description: "Y coordinate (0-1000)", example: 320 })
  y: number;

  @ApiProperty({
    description: "Plant life description",
    example: "Dense forests of blue-leafed trees",
  })
  flora: string;

  @ApiProperty({
    description: "Animal life description",
    example: "Sky whales, crystal deer",
  })
  fauna: string;

  @ApiProperty({
    description: "Full content in markdown",
    example: "# Terra Nova\n\nA lush, Earth-like world...",
  })
  markdown: string;
}

export class CharacterDto {
  @ApiProperty({
    description: "Unique character identifier",
    example: "ch_captain_reyes",
  })
  id: string;

  @ApiProperty({
    description: "Character name",
    example: "Captain Elena Reyes",
  })
  name: string;

  @ApiProperty({ description: "Species", example: "Human" })
  species: string;

  @ApiProperty({ description: "Character role", example: "Starship Captain" })
  role: string;

  @ApiProperty({ description: "Homeworld name", example: "Terra Nova" })
  homeworld: string;

  @ApiProperty({ description: "Birth year (universe calendar)", example: 1247 })
  birthdate: number;

  @ApiProperty({ description: "Death year (universe calendar)", example: 1305 })
  deathDate: number;

  @ApiProperty({
    description: "Life events timeline",
    example: "1247: Born on Terra Nova | 1265: Graduated Academy",
  })
  lifeEvents: string;

  @ApiProperty({
    description: "Full content in markdown",
    example: "# Captain Elena Reyes\n\nA seasoned starship captain...",
  })
  markdown: string;
}

export class CultureDto {
  @ApiProperty({
    description: "Unique culture identifier",
    example: "cu_terran_federation",
  })
  id: string;

  @ApiProperty({ description: "Culture name", example: "Terran Federation" })
  name: string;

  @ApiProperty({ description: "Primary species", example: "Human" })
  species: string;

  @ApiProperty({
    description: "Government type",
    example: "Democratic Republic",
  })
  government: string;

  @ApiProperty({ description: "Technology level", example: "Advanced" })
  technologyLevel: string;

  @ApiProperty({
    description: "Full content in markdown",
    example: "# Terran Federation\n\nA democratic society...",
  })
  markdown: string;
}

export class TechnologyDto {
  @ApiProperty({
    description: "Unique technology identifier",
    example: "t_ftl_drive",
  })
  id: string;

  @ApiProperty({ description: "Technology name", example: "Quantum FTL Drive" })
  name: string;

  @ApiProperty({ description: "Technology type", example: "Propulsion" })
  type: string;

  @ApiProperty({ description: "Technology level", example: "Revolutionary" })
  level: string;

  @ApiProperty({
    description: "Full content in markdown",
    example: "# Quantum FTL Drive\n\nA revolutionary propulsion system...",
  })
  markdown: string;
}

export class EntityDto {
  @ApiProperty({
    description: "Unique entity identifier",
    example: "w_terra_nova",
  })
  id: string;

  @ApiProperty({ description: "Entity name", example: "Terra Nova" })
  name: string;

  @ApiProperty({ description: "Entity title", example: "Terra Nova" })
  title: string;

  @ApiProperty({
    description: "Full content in markdown",
    example: "# Terra Nova\n\nA lush, Earth-like world...",
  })
  markdown: string;

  @ApiProperty({ description: "Entity labels", example: ["World"] })
  labels: string[];
}

export class ApiResponseDto<T> {
  @ApiProperty({ description: "Success status", example: true })
  success: boolean;

  @ApiProperty({ description: "Response data" })
  data: T;

  @ApiProperty({
    description: "Error message (if any)",
    example: "Not found",
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: "Count of items (for lists)",
    example: 5,
    required: false,
  })
  count?: number;
}

export class CharacterRelationshipDto {
  @ApiProperty({ description: "Character ID", example: "ch_captain_reyes" })
  characterId: string;

  @ApiProperty({
    description: "Character name",
    example: "Captain Elena Reyes",
  })
  characterName: string;

  @ApiProperty({
    description: "Homeworld ID",
    example: "w_terra_nova",
    required: false,
  })
  homeworldId?: string;

  @ApiProperty({
    description: "Homeworld name",
    example: "Terra Nova",
    required: false,
  })
  homeworldName?: string;

  @ApiProperty({
    description: "Culture ID",
    example: "cu_terran_federation",
    required: false,
  })
  cultureId?: string;

  @ApiProperty({
    description: "Culture name",
    example: "Terran Federation",
    required: false,
  })
  cultureName?: string;
}

export class TimelineEventDto {
  @ApiProperty({ description: "Event year (universe calendar)", example: 1247 })
  eventYear: number;

  @ApiProperty({
    description: "Event type",
    example: "birth",
    enum: ["birth", "death"],
  })
  eventType: string;

  @ApiProperty({
    description: "Character name",
    example: "Captain Elena Reyes",
  })
  eventName: string;

  @ApiProperty({ description: "Character ID", example: "ch_captain_reyes" })
  characterId: string;

  @ApiProperty({ description: "Character species", example: "Human" })
  species: string;
}

export class SpatialWorldDto {
  @ApiProperty({ description: "World ID", example: "w_terra_nova" })
  id: string;

  @ApiProperty({ description: "World name", example: "Terra Nova" })
  name: string;

  @ApiProperty({ description: "World type", example: "Terrestrial" })
  type: string;

  @ApiProperty({ description: "X coordinate", example: 450 })
  x: number;

  @ApiProperty({ description: "Y coordinate", example: 320 })
  y: number;

  @ApiProperty({ description: "Climate", example: "Temperate" })
  climate: string;

  @ApiProperty({ description: "Atmosphere", example: "Breathable" })
  atmosphere: string;

  @ApiProperty({ description: "Gravity", example: "1.2g" })
  gravity: string;

  @ApiProperty({
    description: "Flora description",
    example: "Dense forests of blue-leafed trees",
  })
  flora: string;

  @ApiProperty({
    description: "Fauna description",
    example: "Sky whales, crystal deer",
  })
  fauna: string;
}
