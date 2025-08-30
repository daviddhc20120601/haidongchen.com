// src/pages/Talk.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export default function Talk() {
  const { id } = useParams();
  const [talk, setTalk] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    async function fetchTalk() {
      try {
        const response = await fetch(`/content/talks/${id}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load talk: ${response.status}`);
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
          const typeMatch = frontmatter.match(/type:\s*["']?(.*?)["']?(\n|$)/);
          const locationMatch = frontmatter.match(/location:\s*["']?(.*?)["']?(\n|$)/);

          if (titleMatch) metadata.title = titleMatch[1].trim();
          if (dateMatch) metadata.date = dateMatch[1].trim();
          if (venueMatch) metadata.venue = venueMatch[1].trim();
          if (typeMatch) metadata.type = typeMatch[1].trim();
          if (locationMatch) metadata.location = locationMatch[1].trim();
        }

        // Remove frontmatter before setting content
        const contentWithoutFrontmatter = text.replace(frontmatterRegex, '');

        setTalk({
          ...metadata,
          content: contentWithoutFrontmatter
        });
      } catch (err) {
        console.error('Error loading talk:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTalk();
  }, [id]);

  // Dynamically import and render mermaid only when mermaid blocks are present
  useEffect(() => {
    if (talk?.content && contentRef.current) {
      const timer = setTimeout(async () => {
        try {
          const nodes = contentRef.current.querySelectorAll('.mermaid');
          if (!nodes || nodes.length === 0) return;

          const mod = await import('mermaid');
          const m = mod && (mod.default || mod);
          if (m && typeof m.initialize === 'function') {
            m.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
          }

          // Prefer m.run when available
          if (m && typeof m.run === 'function') {
            try {
              m.run({ nodes: Array.from(nodes) });
              return;
            } catch (err) {
              console.warn('mermaid.run failed in Talk.jsx', err);
            }
          }

          // Fallback to per-element render
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
                console.warn('mermaid.render failed in Talk.jsx', err);
              }
            }
          });
        } catch (err) {
          console.error('Error rendering mermaid in Talk.jsx', err);
        }
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [talk?.content]);

  // Custom component for code blocks to properly handle Mermaid diagrams
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match && match[1];

      if (!inline && language === 'mermaid') {
        const value = String(children).replace(/\n$/, '');
        return (
          <div className="mermaid">
            {value}
          </div>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  // Format date to a more readable format
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
      <p>Loading talk...</p>
    </div>
  );

  if (error) return <div className="error-message">Error: {error}</div>;

  if (!talk) return <div>Talk not found</div>;

  return (
    <div className="talk-detail">
      <div className="page-header">
        <h1 className="page-title">{talk.title}</h1>
      </div>

      <div className="talk-meta">
        {talk.date && (
          <p className="talk-date">Date: {formatDate(talk.date)}</p>
        )}
        {talk.type && (
          <p className="talk-type">Type: {talk.type}</p>
        )}
        {talk.venue && (
          <p className="talk-venue">Venue: {talk.venue}</p>
        )}
        {talk.location && (
          <p className="talk-location">Location: {talk.location}</p>
        )}
      </div>

      <div ref={contentRef} className="talk-content markdown-content">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {talk.content}
        </ReactMarkdown>
      </div>

      <div className="back-link">
        <Link to="/talks">← Back to all talks</Link>
      </div>
    </div>
  );
}

