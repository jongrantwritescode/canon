import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BuilderService {
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('BUILDER_SERVICE_URL', 'http://localhost:8000');
  }

  async generateUniverse(prompt?: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate/universe`, {
        prompt: prompt || 'Create a new universe with diverse worlds, interesting characters, unique cultures, and advanced technologies'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating universe:', error);
      throw new Error('Failed to generate universe');
    }
  }

  async generateWorld(universeId: string, prompt?: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate/world`, {
        universeId,
        prompt: prompt || 'Create a new world for this universe'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating world:', error);
      throw new Error('Failed to generate world');
    }
  }

  async generateCharacter(universeId: string, prompt?: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate/character`, {
        universeId,
        prompt: prompt || 'Create a new character for this universe'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating character:', error);
      throw new Error('Failed to generate character');
    }
  }

  async generateCulture(universeId: string, prompt?: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate/culture`, {
        universeId,
        prompt: prompt || 'Create a new culture for this universe'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating culture:', error);
      throw new Error('Failed to generate culture');
    }
  }

  async generateTechnology(universeId: string, prompt?: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/generate/technology`, {
        universeId,
        prompt: prompt || 'Create a new technology for this universe'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating technology:', error);
      throw new Error('Failed to generate technology');
    }
  }
}
