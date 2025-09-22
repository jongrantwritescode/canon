import { escapeHtml } from "./dom";

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let inUnorderedList = false;
  let inOrderedList = false;

  const closeLists = () => {
    if (inUnorderedList) {
      html.push("</ul>");
      inUnorderedList = false;
    }
    if (inOrderedList) {
      html.push("</ol>");
      inOrderedList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeLists();
      continue;
    }

    if (/^###\s+/.test(line)) {
      closeLists();
      html.push(`<h3>${formatInline(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }

    if (/^##\s+/.test(line)) {
      closeLists();
      html.push(`<h2>${formatInline(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }

    if (/^#\s+/.test(line)) {
      closeLists();
      html.push(`<h1>${formatInline(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      if (!inUnorderedList) {
        closeLists();
        html.push("<ul>");
        inUnorderedList = true;
      }
      html.push(`<li>${formatInline(line.replace(/^[-*+]\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOrderedList) {
        closeLists();
        html.push("<ol>");
        inOrderedList = true;
      }
      html.push(`<li>${formatInline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    closeLists();
    html.push(`<p>${formatInline(rawLine)}</p>`);
  }

  closeLists();

  return html.join("\n");
}

export function extractSummary(markdown: string, maxLength = 160): string {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}…`;
}
