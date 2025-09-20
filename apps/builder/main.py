from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import json
import uuid
from datetime import datetime

app = FastAPI(title="Canon Builder Service", version="1.0.0")

class GenerateRequest(BaseModel):
    universeId: Optional[str] = None
    prompt: Optional[str] = None

class GenerateResponse(BaseModel):
    id: str
    name: str
    title: str
    markdown: str
    type: str
    createdAt: str

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "canon-builder"}

@app.post("/generate/universe", response_model=GenerateResponse)
async def generate_universe(request: GenerateRequest):
    """Generate a new universe with basic structure"""
    
    universe_id = f"u_{uuid.uuid4().hex[:8]}"
    universe_name = "New Universe"
    
    # Generate universe content using LLM (placeholder for now)
    universe_markdown = f"""# {universe_name}

A newly created universe waiting to be explored and developed.

## Overview
This universe contains diverse worlds, intelligent species, unique cultures, and advanced technologies.

## Structure
- **Worlds**: Various planets and locations
- **Characters**: Intelligent beings and their stories  
- **Cultures**: Societies with unique values and traditions
- **Technologies**: Advanced innovations and alien tech

## Development Status
This universe is in early development. Use the "Create Content" buttons to generate new worlds, characters, cultures, and technologies.
"""
    
    return GenerateResponse(
        id=universe_id,
        name=universe_name,
        title=universe_name,
        markdown=universe_markdown,
        type="Universe",
        createdAt=datetime.now().isoformat()
    )

@app.post("/generate/world", response_model=GenerateResponse)
async def generate_world(request: GenerateRequest):
    """Generate a new world for the universe"""
    
    world_id = f"w_{uuid.uuid4().hex[:8]}"
    world_name = "New World"
    
    world_markdown = f"""# {world_name}

A newly discovered world in the universe.

## Geography
- **Type**: Terrestrial planet
- **Climate**: Temperate
- **Atmosphere**: Breathable
- **Gravity**: 1.0g standard

## Resources
- Rich mineral deposits
- Abundant water sources
- Fertile soil for agriculture
- Unique flora and fauna

## Inhabitants
This world is home to various species and cultures, each with their own unique characteristics and technologies.

## Technology Level
The inhabitants have developed various technologies appropriate to their environment and needs.
"""
    
    return GenerateResponse(
        id=world_id,
        name=world_name,
        title=world_name,
        markdown=world_markdown,
        type="World",
        createdAt=datetime.now().isoformat()
    )

@app.post("/generate/character", response_model=GenerateResponse)
async def generate_character(request: GenerateRequest):
    """Generate a new character for the universe"""
    
    character_id = f"ch_{uuid.uuid4().hex[:8]}"
    character_name = "New Character"
    
    character_markdown = f"""# {character_name}

A newly introduced character in the universe.

## Background
- **Species**: Human
- **Origin**: Unknown
- **Role**: Explorer
- **Age**: Adult

## Personality
- Curious and adventurous
- Diplomatic and thoughtful
- Skilled in various areas
- Known for problem-solving abilities

## Abilities
- Communication skills
- Technical knowledge
- Leadership qualities
- Adaptability

## Relationships
This character has connections to various other beings and organizations in the universe.
"""
    
    return GenerateResponse(
        id=character_id,
        name=character_name,
        title=character_name,
        markdown=character_markdown,
        type="Character",
        createdAt=datetime.now().isoformat()
    )

@app.post("/generate/culture", response_model=GenerateResponse)
async def generate_culture(request: GenerateRequest):
    """Generate a new culture for the universe"""
    
    culture_id = f"cu_{uuid.uuid4().hex[:8]}"
    culture_name = "New Culture"
    
    culture_markdown = f"""# {culture_name}

A newly discovered culture in the universe.

## Overview
This culture represents a unique way of life with its own values, traditions, and social structures.

## Values
- **Core Principles**: Harmony, wisdom, and growth
- **Social Structure**: Community-oriented
- **Decision Making**: Consensus-based
- **Individual Rights**: Balanced with community needs

## Traditions
- Unique cultural practices
- Artistic expressions
- Rituals and ceremonies
- Storytelling traditions

## Technology
The culture has developed technologies that reflect their values and environmental needs.

## Government
A system of governance that aligns with their cultural values and social structure.
"""
    
    return GenerateResponse(
        id=culture_id,
        name=culture_name,
        title=culture_name,
        markdown=culture_markdown,
        type="Culture",
        createdAt=datetime.now().isoformat()
    )

@app.post("/generate/technology", response_model=GenerateResponse)
async def generate_technology(request: GenerateRequest):
    """Generate a new technology for the universe"""
    
    tech_id = f"t_{uuid.uuid4().hex[:8]}"
    tech_name = "New Technology"
    
    tech_markdown = f"""# {tech_name}

A newly developed technology in the universe.

## Overview
This technology represents a significant advancement in the universe's technological capabilities.

## Principles
- **Function**: Core purpose and operation
- **Energy Source**: Power requirements and sources
- **Materials**: Required components and resources
- **Maintenance**: Upkeep and repair needs

## Applications
- Primary uses and benefits
- Secondary applications
- Potential future developments
- Limitations and constraints

## Impact
- Effects on society and culture
- Economic implications
- Environmental considerations
- Ethical implications

## Development
- Research and development process
- Key inventors and contributors
- Timeline of development
- Future potential improvements
"""
    
    return GenerateResponse(
        id=tech_id,
        name=tech_name,
        title=tech_name,
        markdown=tech_markdown,
        type="Technology",
        createdAt=datetime.now().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
