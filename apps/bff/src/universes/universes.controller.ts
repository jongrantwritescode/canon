import { Controller, Get, Post, Param, Body, Res } from "@nestjs/common";
import { Response } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { UniversesService } from "./universes.service";
import { LangflowService } from "../builder/langflow.service";
import {
  UniverseDto,
  EntityDto,
  CharacterRelationshipDto,
  TimelineEventDto,
  SpatialWorldDto,
  ApiResponseDto,
} from "./dto/universe.dto";

@ApiTags("universes")
@Controller()
export class UniversesController {
  constructor(
    private readonly universesService: UniversesService,
    private readonly langflowService: LangflowService
  ) {}

  @Get()
  async getRoot(@Res() res: Response) {
    res.setHeader("Content-Type", "text/html");
    res.send(`
      <div class="content-area">
        <div class="hero">
          <h1>Canon Universe Builder</h1>
          <p>Welcome to the Canon Universe Builder API</p>
          <p>Available endpoints:</p>
          <h3>Web Interface (HTML)</h3>
          <ul>
            <li><a href="/universes">GET /universes</a> - List all universes</li>
            <li><a href="/universes/u_demo">GET /universes/:id</a> - Get universe details</li>
            <li>POST /universes/new - Create new universe</li>
            <li>POST /universes/content/create - Create new content</li>
          </ul>
          <h3>JSON API Endpoints</h3>
          <ul>
            <li><a href="/api/universes">GET /api/universes</a> - List all universes (JSON)</li>
            <li><a href="/api/universes/u_demo">GET /api/universes/:id</a> - Get universe details (JSON)</li>
            <li><a href="/api/universes/u_demo/entities">GET /api/universes/:id/entities</a> - Get universe entities (JSON)</li>
            <li><a href="/api/entities/ch_captain_reyes">GET /api/entities/:id</a> - Get specific entity (JSON)</li>
            <li><a href="/api/characters/ch_captain_reyes/relationships">GET /api/characters/:id/relationships</a> - Get character relationships (JSON)</li>
            <li><a href="/api/worlds/w_terra_nova/inhabitants">GET /api/worlds/:id/inhabitants</a> - Get world inhabitants (JSON)</li>
            <li><a href="/api/cultures/cu_terran_federation/characters">GET /api/cultures/:id/characters</a> - Get culture characters (JSON)</li>
            <li><a href="/api/timeline/u_demo">GET /api/timeline/:universeId</a> - Get universe timeline (JSON)</li>
            <li><a href="/api/spatial/worlds">GET /api/spatial/worlds</a> - Get spatial world data (JSON)</li>
          </ul>
          <h3>API Documentation</h3>
          <p><a href="/api/docs" target="_blank">📚 OpenAPI/Swagger Documentation</a> - Interactive API documentation with examples and schemas</p>
        </div>
      </div>
    `);
  }

  @Get("universes")
  async getUniversesList(@Res() res: Response) {
    const universes = await this.universesService.getUniverses();
    const html = this.universesService.renderUniversesList(universes);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  @Get("universes/:id")
  async getUniverse(@Param("id") id: string, @Res() res: Response) {
    const universe = await this.universesService.getUniverseById(id);
    if (!universe) {
      res.status(404).send('<div class="error">Universe not found</div>');
      return;
    }

    const content = await this.universesService.getUniverseContent(id);
    const html = this.universesService.renderUniversePage(universe, content);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  @Get("universes/:id/category/:category")
  async getCategoryContent(
    @Param("id") id: string,
    @Param("category") category: string,
    @Res() res: Response
  ) {
    const content = await this.universesService.getCategoryContent(
      id,
      category
    );
    const html = this.universesService.renderCategoryContent(category, content);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  @Get("universes/page/:id/fragment")
  async getPageFragment(@Param("id") id: string, @Res() res: Response) {
    const page = await this.universesService.getPageContent(id);
    if (!page) {
      res.status(404).send('<div class="error">Page not found</div>');
      return;
    }

    const html = this.universesService.renderPageFragment(page);
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }

  @Post("new")
  async createUniverse(@Body() body: any, @Res() res: Response) {
    try {
      const { prompt } = body;
      const result = await this.universesService.createNewUniverse(prompt);

      // Return job queued response instead of immediate universe
      res.setHeader("Content-Type", "text/html");
      res.send(`
        <div class="universe-queued">
          <h2>Universe Generation Queued!</h2>
          <p>Job ID: ${result.jobId}</p>
          <p>${result.message}</p>
          <p>Status: ${result.status}</p>
          <button class="ds-button ds-button-primary" onclick="checkJobStatus('${result.jobId}')">
            Check Status
          </button>
        </div>
      `);
    } catch (error) {
      console.error("Error creating universe:", error);
      res
        .status(500)
        .send('<div class="error">Failed to create universe</div>');
    }
  }

  @Post("content/create")
  async createContent(@Body() body: any, @Res() res: Response) {
    try {
      const { universeId, type, prompt } = body;
      const result = await this.universesService.createContent(
        universeId,
        type,
        prompt
      );

      // Return job queued response instead of immediate content
      res.setHeader("Content-Type", "text/html");
      res.send(`
        <div class="content-queued">
          <h3>Content Generation Queued!</h3>
          <p>Job ID: ${result.jobId}</p>
          <p>${result.message}</p>
          <p>Status: ${result.status}</p>
          <button class="ds-button ds-button-primary" onclick="checkJobStatus('${result.jobId}')">
            Check Status
          </button>
        </div>
      `);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).send('<div class="error">Failed to create content</div>');
    }
  }

  @Post("webhook/build-complete")
  async handleBuildComplete(@Body() body: any, @Res() res: Response) {
    try {
      console.log("Received webhook:", body);

      // Validate webhook data
      if (!body.jobId || typeof body.success !== "boolean") {
        res.status(400).json({ error: "Invalid webhook data" });
        return;
      }

      // Process the webhook result
      const result = await this.universesService.processWebhookResult(body);

      res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
        result,
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("job/:jobId/status")
  async getJobStatus(@Param("jobId") jobId: string, @Res() res: Response) {
    try {
      const status = await this.universesService.getJobStatus(jobId);
      if (!status) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.json(status);
    } catch (error) {
      console.error("Error getting job status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  @Get("queue/stats")
  async getQueueStats(@Res() res: Response) {
    try {
      const stats = await this.universesService.getQueueStats();
      res.setHeader("Content-Type", "application/json");
      res.json(stats);
    } catch (error) {
      console.error("Error getting queue stats:", error);
      res.status(500).json({ error: error.message });
    }
  }

  @Get("test/langflow")
  async testLangflow(@Res() res: Response) {
    try {
      const testResult = await this.langflowService.testConnection();
      res.setHeader("Content-Type", "application/json");
      res.send(testResult);
    } catch (error) {
      console.error("Error testing Langflow:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Failed to test Langflow connection",
      });
    }
  }

  // ===== JSON API ENDPOINTS FOR DATABASE TRAVERSAL =====

  @Get("api/universes")
  @ApiOperation({
    summary: "Get all universes",
    description: "Retrieve a list of all universes in the system",
  })
  @ApiResponse({
    status: 200,
    description: "List of universes retrieved successfully",
    type: ApiResponseDto<UniverseDto[]>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUniversesApi(@Res() res: Response) {
    try {
      const universes = await this.universesService.getUniverses();
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: universes,
        count: universes.length,
      });
    } catch (error) {
      console.error("Error getting universes:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/universes/:id")
  @ApiOperation({
    summary: "Get universe by ID",
    description: "Retrieve detailed information about a specific universe",
  })
  @ApiParam({
    name: "id",
    description: "Universe identifier",
    example: "u_demo",
  })
  @ApiResponse({
    status: 200,
    description: "Universe details retrieved successfully",
    type: ApiResponseDto<UniverseDto>,
  })
  @ApiResponse({ status: 404, description: "Universe not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUniverseApi(@Param("id") id: string, @Res() res: Response) {
    try {
      const universe = await this.universesService.getUniverseById(id);
      if (!universe) {
        res.status(404).json({
          success: false,
          error: "Universe not found",
        });
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: universe,
      });
    } catch (error) {
      console.error("Error getting universe:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/universes/:id/entities")
  @ApiOperation({
    summary: "Get universe entities",
    description:
      "Retrieve all entities (worlds, characters, cultures, technologies) within a universe",
  })
  @ApiParam({
    name: "id",
    description: "Universe identifier",
    example: "u_demo",
  })
  @ApiResponse({
    status: 200,
    description: "Universe entities retrieved successfully",
    type: ApiResponseDto<any>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUniverseEntitiesApi(@Param("id") id: string, @Res() res: Response) {
    try {
      const content = await this.universesService.getUniverseContent(id);
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      console.error("Error getting universe entities:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/entities/:id")
  @ApiOperation({
    summary: "Get entity by ID",
    description:
      "Retrieve detailed information about a specific entity (world, character, culture, or technology)",
  })
  @ApiParam({
    name: "id",
    description: "Entity identifier",
    example: "ch_captain_reyes",
  })
  @ApiResponse({
    status: 200,
    description: "Entity details retrieved successfully",
    type: ApiResponseDto<EntityDto>,
  })
  @ApiResponse({ status: 404, description: "Entity not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getEntityApi(@Param("id") id: string, @Res() res: Response) {
    try {
      const entity = await this.universesService.getPageContent(id);
      if (!entity) {
        res.status(404).json({
          success: false,
          error: "Entity not found",
        });
        return;
      }

      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: entity,
      });
    } catch (error) {
      console.error("Error getting entity:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/characters/:id/relationships")
  @ApiOperation({
    summary: "Get character relationships",
    description: "Retrieve a character's homeworld and cultural affiliations",
  })
  @ApiParam({
    name: "id",
    description: "Character identifier",
    example: "ch_captain_reyes",
  })
  @ApiResponse({
    status: 200,
    description: "Character relationships retrieved successfully",
    type: ApiResponseDto<CharacterRelationshipDto[]>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCharacterRelationshipsApi(
    @Param("id") id: string,
    @Res() res: Response
  ) {
    try {
      const relationships =
        await this.universesService.getCharacterRelationships(id);
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: relationships,
      });
    } catch (error) {
      console.error("Error getting character relationships:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/worlds/:id/inhabitants")
  @ApiOperation({
    summary: "Get world inhabitants",
    description:
      "Retrieve all characters and cultures associated with a specific world",
  })
  @ApiParam({
    name: "id",
    description: "World identifier",
    example: "w_terra_nova",
  })
  @ApiResponse({
    status: 200,
    description: "World inhabitants retrieved successfully",
    type: ApiResponseDto<any>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getWorldInhabitantsApi(@Param("id") id: string, @Res() res: Response) {
    try {
      const inhabitants = await this.universesService.getWorldInhabitants(id);
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: inhabitants,
      });
    } catch (error) {
      console.error("Error getting world inhabitants:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/cultures/:id/characters")
  @ApiOperation({
    summary: "Get culture characters",
    description: "Retrieve all characters belonging to a specific culture",
  })
  @ApiParam({
    name: "id",
    description: "Culture identifier",
    example: "cu_terran_federation",
  })
  @ApiResponse({
    status: 200,
    description: "Culture characters retrieved successfully",
    type: ApiResponseDto<any>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCultureCharactersApi(@Param("id") id: string, @Res() res: Response) {
    try {
      const characters = await this.universesService.getCultureCharacters(id);
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: characters,
      });
    } catch (error) {
      console.error("Error getting culture characters:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/timeline/:universeId")
  @ApiOperation({
    summary: "Get universe timeline",
    description:
      "Retrieve chronological timeline of character births and deaths within a universe",
  })
  @ApiParam({
    name: "universeId",
    description: "Universe identifier",
    example: "u_demo",
  })
  @ApiResponse({
    status: 200,
    description: "Universe timeline retrieved successfully",
    type: ApiResponseDto<TimelineEventDto[]>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUniverseTimelineApi(
    @Param("universeId") universeId: string,
    @Res() res: Response
  ) {
    try {
      const timeline =
        await this.universesService.getUniverseTimeline(universeId);
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      console.error("Error getting universe timeline:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  @Get("api/spatial/worlds")
  @ApiOperation({
    summary: "Get spatial world data",
    description:
      "Retrieve all worlds with their coordinates and spatial information for mapping",
  })
  @ApiResponse({
    status: 200,
    description: "Spatial world data retrieved successfully",
    type: ApiResponseDto<SpatialWorldDto[]>,
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getWorldsSpatialApi(@Res() res: Response) {
    try {
      const worlds = await this.universesService.getWorldsSpatial();
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: worlds,
      });
    } catch (error) {
      console.error("Error getting spatial world data:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
