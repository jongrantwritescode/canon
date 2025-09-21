import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface LangflowRequest {
  input_value: string | object;
  session_id?: string;
  output_type?: "text" | "json";
  input_type?: "text" | "json";
}

export interface LangflowResponse {
  result: string;
  session_id: string;
}

@Injectable()
export class LangflowService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly flowId: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("LANGFLOW_API_KEY");
    this.baseUrl = this.configService.get<string>(
      "LANGFLOW_BASE_URL",
      "http://localhost:7860"
    );

    if (!this.apiKey) {
      throw new Error(
        "LANGFLOW_API_KEY environment variable not found. Please set your API key in the environment variables."
      );
    }

    // Using the flow ID from your example
    this.flowId = this.configService.get<string>(
      "LANGFLOW_FLOW_ID",
      "4051bf48-02a2-46a6-8fd7-83ee074125d9"
    );
  }

  async runFlow(request: LangflowRequest): Promise<LangflowResponse> {
    try {
      // Handle both string and object input values
      const inputValue =
        typeof request.input_value === "string"
          ? request.input_value
          : JSON.stringify(request.input_value);

      const response = await fetch(
        `${this.baseUrl}/api/v1/flows/${this.flowId}/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
          },
          body: JSON.stringify({
            input_value: inputValue,
            session_id: request.session_id || "default_session",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract the result from the response
      let result = "";
      if (typeof data.outputs === "string") {
        result = data.outputs;
      } else if (Array.isArray(data.outputs) && data.outputs.length > 0) {
        // If outputs is an array, get the first output's value
        const firstOutput = data.outputs[0];
        if (typeof firstOutput === "string") {
          result = firstOutput;
        } else if (
          firstOutput &&
          typeof firstOutput === "object" &&
          firstOutput.outputs
        ) {
          result = Array.isArray(firstOutput.outputs)
            ? firstOutput.outputs.join("")
            : String(firstOutput.outputs);
        }
      }

      return {
        result: result,
        session_id: request.session_id || "default_session",
      };
    } catch (error) {
      console.error("Error calling Langflow:", error);
      throw new Error(`Failed to call Langflow: ${error.message}`);
    }
  }

  // Method to test if Langflow is accessible and get available flows
  async testConnection(): Promise<any> {
    try {
      // Try to get flows list
      const response = await fetch(`${this.baseUrl}/api/v1/flows`, {
        headers: {
          "x-api-key": this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const flows = await response.json();
      return {
        success: true,
        flows: flows,
        message: `Found ${Array.isArray(flows) ? flows.length : "unknown number of"} flows`,
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
    const requestData = {
      universeId: universeId,
      type: "world",
      action: "generate",
    };

    console.log("Starting world generation");
    const response = await this.runFlow({
      input_value: requestData,
      session_id: sessionId || "world_generation",
      output_type: "text",
      input_type: "json",
    });

    console.log("Langflow response:", JSON.stringify(response.result));
    return response.result;
  }

  async generateCharacter(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    const requestData = {
      universeId: universeId,
      type: "character",
      action: "generate",
    };

    const response = await this.runFlow({
      input_value: requestData,
      session_id: sessionId || "character_generation",
      output_type: "text",
      input_type: "json",
    });

    return response.result;
  }

  async generateCulture(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    const requestData = {
      universeId: universeId,
      type: "culture",
      action: "generate",
    };

    const response = await this.runFlow({
      input_value: requestData,
      session_id: sessionId || "culture_generation",
      output_type: "text",
      input_type: "json",
    });

    return response.result;
  }

  async generateTechnology(
    universeId: string,
    sessionId?: string
  ): Promise<string> {
    const requestData = {
      universeId: universeId,
      type: "technology",
      action: "generate",
    };

    const response = await this.runFlow({
      input_value: requestData,
      session_id: sessionId || "technology_generation",
      output_type: "text",
      input_type: "json",
    });

    return response.result;
  }
}
