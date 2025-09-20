export declare class UniverseDto {
    id: string;
    name: string;
    description: string;
    createdAt: number;
    categories?: string[];
}
export declare class WorldDto {
    id: string;
    name: string;
    type: string;
    climate: string;
    atmosphere: string;
    gravity: string;
    x: number;
    y: number;
    flora: string;
    fauna: string;
    markdown: string;
}
export declare class CharacterDto {
    id: string;
    name: string;
    species: string;
    role: string;
    homeworld: string;
    birthdate: number;
    deathDate: number;
    lifeEvents: string;
    markdown: string;
}
export declare class CultureDto {
    id: string;
    name: string;
    species: string;
    government: string;
    technologyLevel: string;
    markdown: string;
}
export declare class TechnologyDto {
    id: string;
    name: string;
    type: string;
    level: string;
    markdown: string;
}
export declare class EntityDto {
    id: string;
    name: string;
    title: string;
    markdown: string;
    labels: string[];
}
export declare class ApiResponseDto<T> {
    success: boolean;
    data: T;
    error?: string;
    count?: number;
}
export declare class CharacterRelationshipDto {
    characterId: string;
    characterName: string;
    homeworldId?: string;
    homeworldName?: string;
    cultureId?: string;
    cultureName?: string;
}
export declare class TimelineEventDto {
    eventYear: number;
    eventType: string;
    eventName: string;
    characterId: string;
    species: string;
}
export declare class SpatialWorldDto {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    climate: string;
    atmosphere: string;
    gravity: string;
    flora: string;
    fauna: string;
}
