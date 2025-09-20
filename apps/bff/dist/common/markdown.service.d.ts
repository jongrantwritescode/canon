export declare class MarkdownService {
    constructor();
    convertToHtml(markdown: string): string;
    extractTitle(markdown: string): string;
    extractSummary(markdown: string, maxLength?: number): string;
}
