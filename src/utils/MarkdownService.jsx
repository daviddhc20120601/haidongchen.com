// src/components/MarkdownPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';

// Function to fetch pre-generated JSON data for collections
export async function getMarkdownFiles(type) {
  // Construct the path to the JSON file in the public/data directory
  const jsonPath = `/data/${type}.json`; // Assumes JSON files are served from /data/
  try {
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${type} data: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${jsonPath}:`, error);
    // Re-throw the error to be caught by the calling component
    throw error;
  }
}

// Renamed the component to avoid confusion with the service functions
export function MarkdownRenderer({ filePath }) {
  const [content, setContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);
  const location = useLocation();
  // Check if we're on the home page
  const useStyledFormat = location.pathname === '/';

  useEffect(() => {
    async function fetchMarkdown() {
      setIsLoading(true); // Start loading before fetch
      setError(null); // Reset error
      try {
        // Use the filePath directly. Fetch expects paths relative to the root
        // or the current page. Paths starting with '/' are root-relative.
        // No need to modify filePath here.
        const response = await fetch(filePath);
        if (!response.ok) {
          // Provide more specific error info
          throw new Error(`Failed to load markdown '${filePath}': ${response.status} ${response.statusText}`);
        }

        const text = await response.text();

        // Parse frontmatter if present
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = text.match(frontmatterRegex);

        if (match) {
          const frontmatter = match[1];

          // Extract title from frontmatter
          const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?(\n|$)/);
          if (titleMatch) {
            setPageTitle(titleMatch[1].trim());
          }
        }

        // Remove frontmatter before setting content
        const contentWithoutFrontmatter = text.replace(frontmatterRegex, '');
        setContent(contentWithoutFrontmatter);
      } catch (err) {
        console.error('Error loading markdown:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarkdown();
  }, [filePath]);

  // Initialize Mermaid when content changes
  useEffect(() => {
    if (content && contentRef.current) {
      // Dynamically import mermaid only when needed and on the client-side
      import('mermaid').then(mermaid => {
        mermaid.default.initialize({
          startOnLoad: true,
          theme: 'default',
          securityLevel: 'loose'
        });

        try {
          // Run mermaid on the next tick after React has rendered the content
          setTimeout(() => {
            mermaid.default.run({ nodes: contentRef.current.querySelectorAll('.mermaid') });
          }, 0);
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }).catch(error => {
        console.error('Failed to load Mermaid library:', error);
      });
    }
  }, [content]);

  // Custom component for code blocks to properly handle Mermaid diagrams
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match && match[1];

      if (!inline && language === 'mermaid') {
        return (
          <div className="mermaid">
            {String(children).replace(/\n$/, '')}
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

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading content...</p>
    </div>
  );

  if (error) return <div className="error-message">Error: {error}</div>;

  if (useStyledFormat) {
    return (
      <div className="home-container" ref={contentRef}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div ref={contentRef}>
      {pageTitle && (
        <div className="page-header">
          <h1 className="page-title">{pageTitle}</h1>
        </div>
      )}
      <div className="markdown-content">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

