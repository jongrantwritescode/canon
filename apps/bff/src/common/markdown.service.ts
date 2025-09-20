import { Injectable } from '@nestjs/common';
import { marked } from 'marked';

@Injectable()
export class MarkdownService {
  constructor() {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  convertToHtml(markdown: string): string {
    if (!markdown) return '';
    return marked(markdown);
  }

  extractTitle(markdown: string): string {
    const lines = markdown.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return 'Untitled';
  }

  extractSummary(markdown: string, maxLength: number = 150): string {
    const html = this.convertToHtml(markdown);
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}
