/**
 * Formats article content for proper display
 * - Converts headings to bold HTML headings
 * - Adds proper spacing between sections
 * - Preserves lists and structure
 */
export function formatArticleContent(content: string): string {
  if (!content) return '';
  
  // Split content into lines
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
    
    // Detect major section headings (lines that end without punctuation and are relatively short)
    if (line.length < 100 && !line.match(/[.!?,;:]$/) && line.match(/^[A-Z]/)) {
      // Check if next line is content (not another heading)
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && (nextLine.length > 100 || nextLine.match(/[.!?,;:]$/))) {
        formattedLines.push(`<h2 class="text-2xl font-bold mb-4 mt-8">${line}</h2>`);
        continue;
      }
    }
    
    // Detect sub-headings (shorter, capitalized lines)
    if (line.length < 80 && !line.match(/[.!?,;:]$/) && line.match(/^[A-Z]/) && line.match(/[A-Z][a-z]/)) {
      formattedLines.push(`<h3 class="text-xl font-bold mb-3 mt-6">${line}</h3>`);
      continue;
    }
    
    // Detect list items
    if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
      formattedLines.push(`<li class="ml-6 mb-2">${line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '')}</li>`);
      continue;
    }
    
    // Regular paragraphs
    formattedLines.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
  }
  
  return formattedLines.join('\n');
}
