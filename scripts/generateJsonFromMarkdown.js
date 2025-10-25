// scripts/generateJsonFromMarkdown.js
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

// Function to extract frontmatter from markdown content
function extractFrontmatter(markdown) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = markdown.match(frontmatterRegex);

  if (!match) return {};

  try {
    // Parse YAML frontmatter
    const metadata = yaml.load(match[1]) || {};

    // Extract excerpt from the content if not in frontmatter
    if (!metadata.excerpt) {
      const contentWithoutFrontmatter = markdown.replace(frontmatterRegex, '').trim();
      const firstParagraph = contentWithoutFrontmatter.split('\n\n')[0];
      metadata.excerpt = firstParagraph.slice(0, 150) + (firstParagraph.length > 150 ? '...' : '');
    }

    return metadata;
  } catch (error) {
    console.error('Error parsing YAML frontmatter:', error);
    return {};
  }
}

async function processDirectory(dirPath, outputFile) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const result = [];

    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.md')) {
        // Process individual markdown files
        const filePath = path.join(dirPath, file.name);
        const content = await fs.readFile(filePath, 'utf8');
        const metadata = extractFrontmatter(content);

        // Generate ID from filename (remove extension)
        const id = file.name.replace(/\.md$/, '');

        result.push({
          id,
          ...metadata,
          filename: file.name
        });
      } else if (file.isDirectory()) {
        // Check if directory contains an index.md file (multi-file book)
        const indexPath = path.join(dirPath, file.name, 'index.md');
        try {
          await fs.access(indexPath);
          // Directory has an index.md, process it as a book
          const content = await fs.readFile(indexPath, 'utf8');
          const metadata = extractFrontmatter(content);

          result.push({
            id: file.name,
            ...metadata,
            filename: file.name // Use directory name as filename for multi-file books
          });
        } catch (err) {
          // No index.md in this directory, skip it
          continue;
        }
      }
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

  // Process books
  await processDirectory('public/content/books', 'public/data/books.json');

  // Process robot simulations
  await processDirectory('public/content/robot-simulations', 'public/data/robot-simulations.json');
}

main().catch(err => console.error('Error generating JSON files:', err));