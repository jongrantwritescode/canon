export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatDate(timestamp?: number | string | null): string {
  if (!timestamp) {
    return "";
  }

  try {
    const date =
      typeof timestamp === "number"
        ? new Date(timestamp)
        : new Date(String(timestamp));
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString();
  } catch (error) {
    console.error("Failed to format date", error);
    return "";
  }
}
