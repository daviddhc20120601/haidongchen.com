// scripts/generateJsonFromMarkdown.js
import fs from 'fs/promises';
import path from 'path';

// Function to extract frontmatter from markdown content
function extractFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = markdown.match(frontmatterRegex);

  if (!match) return {};

  const frontmatter = match[1];
  const metadata = {};

  // Extract each field from the frontmatter
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }

    metadata[key] = value;
  }

  // Extract excerpt from the content if not in frontmatter
  if (!metadata.excerpt) {
    const contentWithoutFrontmatter = markdown.replace(frontmatterRegex, '').trim();
    const firstParagraph = contentWithoutFrontmatter.split('\n\n')[0];
    metadata.excerpt = firstParagraph.slice(0, 150) + (firstParagraph.length > 150 ? '...' : '');
  }

  return metadata;
}

async function processDirectory(dirPath, outputFile) {
  try {
    const files = await fs.readdir(dirPath);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    const result = [];

    for (const file of markdownFiles) {
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      const metadata = extractFrontmatter(content);

      // Generate ID from filename (remove extension)
      const id = file.replace(/\.md$/, '');

      result.push({
        id,
        ...metadata,
        filename: file
      });
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Ensure output directory exists
    const outputDir = path.dirname(outputFile);
    await fs.mkdir(outputDir, { recursive: true });

    // Write the JSON file
    await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
    console.log(`Generated ${outputFile} with ${result.length} entries`);

    return result;
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error);
    return [];
  }
}

async function main() {
  // Create data directory if it doesn't exist
  await fs.mkdir('public/data', { recursive: true });

  // Process publications
  await processDirectory('public/content/publications', 'public/data/publications.json');

  // Process talks
  await processDirectory('public/content/talks', 'public/data/talks.json');
}

main().catch(err => console.error('Error generating JSON files:', err));