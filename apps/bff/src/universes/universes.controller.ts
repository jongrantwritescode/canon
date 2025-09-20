import { Controller, Get, Post, Param, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { UniversesService } from './universes.service';

@Controller()
export class UniversesController {
  constructor(private readonly universesService: UniversesService) {}

  @Get()
  async getRoot(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <div class="content-area">
        <div class="hero">
          <h1>Canon Universe Builder</h1>
          <p>Welcome to the Canon Universe Builder API</p>
          <p>Available endpoints:</p>
          <ul>
            <li><a href="/universes">GET /universes</a> - List all universes</li>
            <li><a href="/universes/u_demo">GET /universes/:id</a> - Get universe details</li>
            <li>POST /universes/new - Create new universe</li>
            <li>POST /universes/content/create - Create new content</li>
          </ul>
        </div>
      </div>
    `);
  }

  @Get('universes')
  async getUniversesList(@Res() res: Response) {
    const universes = await this.universesService.getUniverses();
    const html = this.universesService.renderUniversesList(universes);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get(':id')
  async getUniverse(@Param('id') id: string, @Res() res: Response) {
    const universe = await this.universesService.getUniverseById(id);
    if (!universe) {
      res.status(404).send('<div class="error">Universe not found</div>');
      return;
    }
    
    const content = await this.universesService.getUniverseContent(id);
    const html = this.universesService.renderUniversePage(universe, content);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get(':id/category/:category')
  async getCategoryContent(
    @Param('id') id: string,
    @Param('category') category: string,
    @Res() res: Response
  ) {
    const content = await this.universesService.getCategoryContent(id, category);
    const html = this.universesService.renderCategoryContent(category, content);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('page/:id/fragment')
  async getPageFragment(@Param('id') id: string, @Res() res: Response) {
    const page = await this.universesService.getPageContent(id);
    if (!page) {
      res.status(404).send('<div class="error">Page not found</div>');
      return;
    }
    
    const html = this.universesService.renderPageFragment(page);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Post('new')
  async createUniverse(@Res() res: Response) {
    try {
      const universe = await this.universesService.createNewUniverse();
      const html = this.universesService.renderUniverseCreated(universe);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error creating universe:', error);
      res.status(500).send('<div class="error">Failed to create universe</div>');
    }
  }

  @Post('content/create')
  async createContent(@Body() body: any, @Res() res: Response) {
    try {
      const { universeId, type, prompt } = body;
      const content = await this.universesService.createContent(universeId, type, prompt);
      const html = this.universesService.renderContentCreated(content);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error creating content:', error);
      res.status(500).send('<div class="error">Failed to create content</div>');
    }
  }
}
