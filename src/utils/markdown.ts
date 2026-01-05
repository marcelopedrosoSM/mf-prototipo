/**
 * Simple markdown parser for chat messages
 * Supports: **bold**, *italic*, `code`, [links](url), lists
 */

export function parseMarkdown(text: string): string {
    if (!text) return '';

    let html = text;

    // Escape HTML
    html = html.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic: *text* or _text_
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Code: `text`
    html = html.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Links: [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}

/**
 * Check if text contains markdown syntax
 */
export function hasMarkdown(text: string): boolean {
    if (!text) return false;

    const markdownPatterns = [
        /\*\*(.+?)\*\*/,  // Bold
        /__(.+?)__/,      // Bold alt
        /\*(.+?)\*/,      // Italic
        /_(.+?)_/,        // Italic alt
        /`(.+?)`/,        // Code
        /\[([^\]]+)\]\(([^)]+)\)/ // Links
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
}
