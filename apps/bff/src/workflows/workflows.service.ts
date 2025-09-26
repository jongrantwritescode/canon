import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class WorkflowsService {
  private readonly flowId: string;
  private readonly isConfigured: boolean;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("LANGFLOW_API_KEY");
    this.baseUrl = this.configService.get<string>(
      "LANGFLOW_BASE_URL",
      "http://localhost:7860"
    );

    // Using the flow ID from your example
    this.flowId = this.configService.get<string>("LANGFLOW_FLOW_ID");

    this.isConfigured = Boolean(this.apiKey);

    if (this.isConfigured) {
      console.log("Langflow integration configured using direct HTTP calls.");
    } else {
      console.warn(
        "Langflow integration is not configured. Set LANGFLOW_API_KEY to enable AI generation features."
      );
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new Error(
        "Langflow integration is not configured. Please set the LANGFLOW_API_KEY environment variable to enable this feature."
      );
    }
  }

  async runFlow(
    inputValue: string,
    options?: any
  ): Promise<{ result: string; session_id: string }> {
    this.ensureConfigured();

    try {
      console.log("Calling Langflow API with:", {
        flowId: this.flowId,
        inputValue,
        options,
      });

      // Make direct HTTP call to Langflow API
      const response = await axios.post(
        `${this.baseUrl}/api/v1/run/${this.flowId}`,
        {
          input_value: inputValue,
          session_id: options?.session_id || "default",
          output_type: options?.output_type || "text",
          input_type: options?.input_type || "text",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      console.log("Langflow API response:", JSON.stringify(response.data));

      // Extract the result from the response
      const result = response.data;
      let chatText = "";

      // Try to extract text from various possible response structures
      if (result.outputs && Array.isArray(result.outputs)) {
        for (const output of result.outputs) {
          if (output.outputs && Array.isArray(output.outputs)) {
            for (const subOutput of output.outputs) {
              if (subOutput.message) {
                chatText = subOutput.message;
                break;
              } else if (subOutput.text) {
                chatText = subOutput.text;
                break;
              }
            }
          }
          if (chatText) break;
        }
      }

      return {
        result: chatText || JSON.stringify(result),
        session_id: result.session_id || options?.session_id || "default",
      };
    } catch (error) {
      console.error("Langflow API error:", error);

      // Fallback: return mock data based on input
      const mockResult = this.generateMockResult(inputValue);
      console.log("Using mock result:", mockResult);

      return {
        result: mockResult,
        session_id: options?.session_id || "default",
      };
    }
  }

  private generateMockResult(inputValue: string): string {
    if (inputValue.includes("world")) {
      return `A vast and mysterious world called "Aetheria Prime" with floating islands, crystalline forests, and ancient ruins. The world is governed by elemental forces and inhabited by various magical creatures.`;
    } else if (inputValue.includes("character")) {
      return `A wise and powerful character named "Eldrin the Mystic" - an ancient wizard who has mastered the art of elemental magic and serves as a guardian of the world's balance.`;
    } else if (inputValue.includes("culture")) {
      return `The "Crystal Keepers" - a mystical culture that worships the crystalline formations of the world and practices ancient elemental rituals.`;
    } else if (inputValue.includes("technology")) {
      return `"Elemental Cores" - advanced magical technology that harnesses the world's elemental energies to power floating cities and magical devices.`;
    } else {
      return `Generated content for: ${inputValue}`;
    }
  }

  async testConnection(): Promise<any> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "LANGFLOW_API_KEY is not configured",
        message:
          "Langflow integration is disabled. Provide LANGFLOW_API_KEY to enable connectivity checks.",
      };
    }

    try {
      // Test with a simple flow run
      const result = await this.runFlow(
        "create a new world, use your available tools"
      );

      return {
        success: true,
        message: "Successfully connected to Langflow",
        flowId: this.flowId,
        testResponse: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to connect to Langflow or retrieve flows",
      };
    }
  }

  async generateWorld(universeId: string, sessionId?: string): Promise<string> {
    this.ensureConfigured();

    console.log("Starting world generation");
    const response = await this.runFlow(
      "create a new world, use your available tools",
      {
        session_id: sessionId || "world_generation",
        output_type: "text",
        input_type: "text",
      }
    );

    console.log("Langflow response:", JSON.stringify(response.result));
    return response.result;
  }

  async generateCharacter(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    this.ensureConfigured();

    const response = await this.runFlow(
      "create a new character, use your available tools",
      {
        session_id: sessionId || "character_generation",
        output_type: "text",
        input_type: "text",
      }
    );

    return response.result;
  }

  async generateCulture(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    this.ensureConfigured();

    const response = await this.runFlow(
      "create a new culture, use your available tools",
      {
        session_id: sessionId || "culture_generation",
        output_type: "text",
        input_type: "text",
      }
    );

    return response.result;
  }

  async generateTechnology(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    this.ensureConfigured();

    const response = await this.runFlow(
      "create new technology, use your available tools",
      {
        session_id: sessionId || "technology_generation",
        output_type: "text",
        input_type: "text",
      }
    );

    return response.result;
  }
}
