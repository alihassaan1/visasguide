/**
 * Formats article content for proper display
 * - If content is already HTML (from rich text editor), returns it with enhanced spacing
 * - If content is plain text, converts it to formatted HTML
 */
export function formatArticleContent(content: string): string {
  if (!content) return '';
  
  // Strip markdown code fences (```html, ```, etc.) that wrap the content
  let cleaned = content
    .replace(/^```\w*\s*\n?/gm, '')
    .replace(/```\s*$/gm, '')
    .trim();
  
  // Check if content is already HTML (contains HTML tags)
  const hasHTMLTags = /<[^>]+>/.test(cleaned);
  
  if (hasHTMLTags) {
    // Content is already HTML from rich text editor
    let formatted = cleaned
      // Add spacing classes to headings
      .replace(/<h1>/gi, '<h1 class="text-3xl font-bold mb-6 mt-8">')
      .replace(/<h2>/gi, '<h2 class="text-2xl font-bold mb-4 mt-8">')
      .replace(/<h3>/gi, '<h3 class="text-xl font-bold mb-3 mt-6">')
      .replace(/<h4>/gi, '<h4 class="text-lg font-bold mb-2 mt-4">')
      .replace(/<h5>/gi, '<h5 class="text-base font-bold mb-2 mt-3">')
      .replace(/<h6>/gi, '<h6 class="text-sm font-bold mb-2 mt-2">')
      // Add spacing to paragraphs
      .replace(/<p>/gi, '<p class="mb-4 leading-relaxed">')
      // Add spacing to lists
      .replace(/<ul>/gi, '<ul class="mb-4 ml-6 list-disc space-y-2">')
      .replace(/<ol>/gi, '<ol class="mb-4 ml-6 list-decimal space-y-2">')
      .replace(/<li>/gi, '<li class="leading-relaxed">')
      // Add styling to blockquotes
      .replace(/<blockquote>/gi, '<blockquote class="border-l-4 border-primary pl-4 italic my-4">')
      // Ensure strong/bold tags are visible
      .replace(/<strong>/gi, '<strong class="font-bold">')
      .replace(/<b>/gi, '<b class="font-bold">')
      // Add styling to emphasis
      .replace(/<em>/gi, '<em class="italic">');
    
    return formatted;
  }
  
  // Content is plain text - convert to HTML with formatting
  let lines = content.split('\n');
  let formattedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines but preserve them as spacing
    if (line === '') {
      formattedLines.push('<br />');
      continue;
    }
    
    // Main title (first line if significantly larger)
    if (i === 0 && line.length > 50) {
      formattedLines.push(`<h1 class="text-3xl font-bold mb-6 mt-8">${line}</h1>`);
      continue;
    }
    
    // Detect major section headings
    if (line.length < 100 && !line.match(/[.!?,;:]$/) && line.match(/^[A-Z]/)) {
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && (nextLine.length > 100 || nextLine.match(/[.!?,;:]$/))) {
        formattedLines.push(`<h2 class="text-2xl font-bold mb-4 mt-8">${line}</h2>`);
        continue;
      }
    }
    
    // Detect sub-headings
    if (line.length < 80 && !line.match(/[.!?,;:]$/) && line.match(/^[A-Z]/) && line.match(/[A-Z][a-z]/)) {
      formattedLines.push(`<h3 class="text-xl font-bold mb-3 mt-6">${line}</h3>`);
      continue;
    }
    
    // Detect list items
    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
      formattedLines.push(`<li class="ml-6 mb-2 leading-relaxed">${line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '')}</li>`);
      continue;
    }
    
    // Regular paragraphs
    formattedLines.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
  }
  
  return formattedLines.join('\n');
}
