// src/pages/Talk.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
// Import mermaid correctly
import mermaid from 'mermaid';

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

  // Initialize mermaid just once when component mounts
  useEffect(() => {
    // Initialize mermaid with simple configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif'
    });
  }, []);

  // Run mermaid render after content is loaded and rendered
  useEffect(() => {
    if (talk?.content && contentRef.current) {
      // Use a timeout to ensure DOM has finished rendering
      const timer = setTimeout(() => {
        try {
          // Simple direct call to mermaid.init
          mermaid.init(undefined, '.mermaid');
        } catch (err) {
          console.error('Mermaid rendering error:', err);
        }
      }, 100);
      
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

