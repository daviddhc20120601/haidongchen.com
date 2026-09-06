// scripts/generateJsonFromMarkdown.js
// AI-assisted (Cursor) — review before merge.
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const SITE_URL = 'https://haidongchen.com';

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

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function encodePath(...segments) {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
}

function sitemapEntry(pathname, { lastmod, priority = '0.7', changefreq = 'monthly' } = {}) {
  const parsedDate = lastmod ? new Date(lastmod) : null;
  const validLastmod = parsedDate && !Number.isNaN(parsedDate.getTime())
    ? `\n    <lastmod>${parsedDate.toISOString().slice(0, 10)}</lastmod>`
    : '';

  return `  <url>
    <loc>${escapeXml(`${SITE_URL}${pathname}`)}</loc>${validLastmod}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap({ publications, talks, books, robotSimulations }) {
  const entries = [
    sitemapEntry('/', { priority: '1.0', changefreq: 'weekly' }),
    sitemapEntry('/about', { priority: '0.9' }),
    sitemapEntry('/publications', { priority: '0.8' }),
    sitemapEntry('/talks', { priority: '0.9', changefreq: 'weekly' }),
    sitemapEntry('/research', { priority: '0.8' }),
    sitemapEntry('/robot-simulations', { priority: '0.7' }),
    sitemapEntry('/books', { priority: '0.7', changefreq: 'weekly' }),
    ...talks.map((item) =>
      sitemapEntry(encodePath('talk', item.id), {
        lastmod: item.date,
        priority: '0.8',
        changefreq: 'yearly',
      })
    ),
    ...publications.map((item) =>
      sitemapEntry(encodePath('publication', item.id), {
        lastmod: item.date,
        priority: '0.7',
        changefreq: 'yearly',
      })
    ),
    ...robotSimulations.map((item) =>
      sitemapEntry(encodePath('robot-simulation', item.id), {
        lastmod: item.date,
        priority: '0.7',
        changefreq: 'yearly',
      })
    ),
  ];

  for (const book of books) {
    entries.push(
      sitemapEntry(encodePath('book', book.id), {
        lastmod: book.date,
        priority: '0.7',
        changefreq: book.status === '连载中' ? 'weekly' : 'yearly',
      })
    );

    const bookDirectory = path.join('public/content/books', book.id);
    try {
      const files = await fs.readdir(bookDirectory);
      const chapterIds = files
        .filter((filename) => filename.endsWith('.md') && filename !== 'index.md')
        .map((filename) => filename.replace(/\.md$/, ''))
        .sort();

      if (chapterIds.length > 0) {
        entries.push(
          sitemapEntry(encodePath('book', book.id, 'contents'), {
            lastmod: book.date,
            priority: '0.6',
          })
        );
      }

      for (const chapterId of chapterIds) {
        entries.push(
          sitemapEntry(encodePath('book', book.id, 'chapter', chapterId), {
            lastmod: book.date,
            priority: '0.5',
            changefreq: 'yearly',
          })
        );
      }
    } catch {
      // Single-file books do not have a directory or chapter routes.
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  await fs.writeFile('public/sitemap.xml', sitemap);
  console.log(`Generated public/sitemap.xml with ${entries.length} URLs`);
}

async function main() {
  // Create data directory if it doesn't exist
  await fs.mkdir('public/data', { recursive: true });

  // Process publications
  const publications = await processDirectory(
    'public/content/publications',
    'public/data/publications.json'
  );

  // Process talks
  const talks = await processDirectory('public/content/talks', 'public/data/talks.json');

  // Process books
  const books = await processDirectory('public/content/books', 'public/data/books.json');

  // Process robot simulations
  const robotSimulations = await processDirectory(
    'public/content/robot-simulations',
    'public/data/robot-simulations.json'
  );

  await generateSitemap({ publications, talks, books, robotSimulations });
}

main().catch(err => console.error('Error generating JSON files:', err));