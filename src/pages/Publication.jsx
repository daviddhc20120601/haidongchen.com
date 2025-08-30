// src/pages/Publication.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export default function Publication() {
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    async function fetchPublication() {
      try {
        const response = await fetch(`/content/publications/${id}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load publication: ${response.status}`);
        }

        const text = await response.text();

        // Parse frontmatter
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = text.match(frontmatterRegex);
        const metadata = {};

        if (match) {
          const frontmatter = match[1];

          // Extract key metadata
          const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?(\n|$)/);
          const dateMatch = frontmatter.match(/date:\s*["']?(.*?)["']?(\n|$)/);
          const venueMatch = frontmatter.match(/venue:\s*["']?(.*?)["']?(\n|$)/);
          const citationMatch = frontmatter.match(/citation:\s*["']?(.*?)["']?(\n|$)/);
          const paperurlMatch = frontmatter.match(/paperurl:\s*["']?(.*?)["']?(\n|$)/);

          if (titleMatch) metadata.title = titleMatch[1].trim();
          if (dateMatch) metadata.date = dateMatch[1].trim();
          if (venueMatch) metadata.venue = venueMatch[1].trim();
          if (citationMatch) metadata.citation = citationMatch[1].trim();
          if (paperurlMatch) metadata.paperurl = paperurlMatch[1].trim();
        }

        // Remove frontmatter before setting content
        const contentWithoutFrontmatter = text.replace(frontmatterRegex, '');

        setPublication({
          ...metadata,
          content: contentWithoutFrontmatter
        });
      } catch (err) {
        console.error('Error loading publication:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPublication();
  }, [id]);

  // Dynamically import mermaid and render diagrams when content changes
  useEffect(() => {
    if (publication?.content && contentRef.current) {
      const timer = setTimeout(async () => {
        try {
          const nodes = contentRef.current.querySelectorAll('.mermaid');
          if (!nodes || nodes.length === 0) return;

          const mod = await import('mermaid');
          const m = mod && (mod.default || mod);
          if (m && typeof m.initialize === 'function') {
            m.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
          }

          if (m && typeof m.run === 'function') {
            try {
              m.run({ nodes: Array.from(nodes) });
              return;
            } catch (err) {
              console.warn('mermaid.run failed in Publication.jsx', err);
            }
          }

          nodes.forEach((el) => {
            const code = el.textContent || '';
            const id = 'mermaid-' + Math.random().toString(36).slice(2, 9);
            if (m && m.mermaidAPI && typeof m.mermaidAPI.render === 'function') {
              m.mermaidAPI.render(id, code, (svg) => { el.innerHTML = svg; });
            } else if (m && typeof m.render === 'function') {
              try {
                const svg = m.render(id, code);
                el.innerHTML = typeof svg === 'string' ? svg : (svg && svg.svg ? svg.svg : '');
              } catch (err) {
                console.warn('mermaid.render failed in Publication.jsx', err);
              }
            }
          });
        } catch (err) {
          console.error('Error rendering mermaid in Publication.jsx', err);
        }
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [publication?.content]);

  // Format date to a more readable format (December 5, 2023)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading publication...</p>
    </div>
  );

  if (error) return <div className="error-message">Error: {error}</div>;

  if (!publication) return <div>Publication not found</div>;

  return (
    <div className="publication-detail">
      <div className="page-header">
        <h1 className="page-title">{publication.title}</h1>
      </div>

      <div className="publication-meta">
        {publication.date && (
          <p className="publication-date">Published on: {formatDate(publication.date)}</p>
        )}
        {publication.venue && (
          <p className="publication-venue">Venue: {publication.venue}</p>
        )}
        {publication.citation && (
          <div className="publication-citation" dangerouslySetInnerHTML={{ __html: publication.citation }}></div>
        )}
        {publication.paperurl && (
          <div className="publication-links">
            <a href={publication.paperurl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              Download Paper
            </a>
          </div>
        )}
      </div>

      <div ref={contentRef} className="publication-content markdown-content">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
        >
          {publication.content}
        </ReactMarkdown>
      </div>

      <div className="back-link">
        <Link to="/publications">← Back to all publications</Link>
      </div>
    </div>
  );
}