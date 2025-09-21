import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class LangflowService {
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
      throw error;
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
      const result = await this.runFlow("create_world");

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
    const response = await this.runFlow("create_world", {
      session_id: sessionId || "world_generation",
      output_type: "text",
      input_type: "text",
    });

    console.log("Langflow response:", JSON.stringify(response.result));
    return response.result;
  }

  async generateCharacter(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    this.ensureConfigured();

    const response = await this.runFlow("create_character", {
      session_id: sessionId || "character_generation",
      output_type: "text",
      input_type: "text",
    });

    return response.result;
  }

  async generateCulture(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    this.ensureConfigured();

    const response = await this.runFlow("create_culture", {
      session_id: sessionId || "culture_generation",
      output_type: "text",
      input_type: "text",
    });

    return response.result;
  }

  async generateTechnology(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    this.ensureConfigured();

    const response = await this.runFlow("create_technology", {
      session_id: sessionId || "technology_generation",
      output_type: "text",
      input_type: "text",
    });

    return response.result;
  }
}
