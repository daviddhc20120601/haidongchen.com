// src/components/MarkdownPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import mermaid from 'mermaid';

export default function MarkdownPage({ filePath }) {
  const [content, setContent] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);
  const location = useLocation();
  const useStyledFormat = location.pathname === '/';

  // Determine if this is the About page (root path)
  const isAboutPage = location.pathname === '/';

  useEffect(() => {
    async function fetchMarkdown() {
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }

        const text = await response.text();

        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = text.match(frontmatterRegex);

        if (match) {
          const frontmatter = match[1];
          const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?(\n|$)/);
          if (titleMatch) {
            setPageTitle(titleMatch[1].trim());
          }
        }

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

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'sans-serif'
    });
  }, []);

  useEffect(() => {
    if (content && contentRef.current) {
      const timer = setTimeout(() => {
        try {
          mermaid.init(undefined, '.mermaid');
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [content]);

  const components = {
    // Custom component for headers on the About page
    h1: ({ node, ...props }) => {
      if (isAboutPage) {
        return <h1 className="resume-name" {...props} />;
      }
      return <h1 {...props} />;
    },
    h2: ({ node, ...props }) => {
      if (isAboutPage) {
        // Check if this is the job title (right after h1)
        if (props.children && props.children[0] && 
            (props.children[0].includes('Director') || 
             props.children[0].includes('Senior') ||
             props.children[0].includes('Lead'))) {
          return <h2 className="resume-title" {...props} />;
        }
        return <h2 className="resume-section-header" {...props} />;
      }
      return <h2 {...props} />;
    },
    h3: ({ node, ...props }) => {
      if (isAboutPage) {
        return <h3 className="resume-subsection" {...props} />;
      }
      return <h3 {...props} />;
    },
    h4: ({ node, ...props }) => {
      if (isAboutPage) {
        return <h4 className="resume-job-title" {...props} />;
      }
      return <h4 {...props} />;
    },
    // Process code blocks for mermaid and also transform markdown sections into styled sections
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
    },
    // Transform paragraphs in about page
    p: ({ node, ...props }) => {
      // Process tech stack listings
      if (isAboutPage && 
          props.children && 
          typeof props.children === 'string' && 
          (props.children.includes('Technologies:') || 
           props.children.includes('Recent Engagements:') ||
           props.children.includes('Focus Areas:'))) {
        
        const content = props.children;
        if (content.includes('Technologies:')) {
          const techs = content.replace('Technologies:', '').split(',').map(tech => tech.trim());
          return (
            <div className="tech-stack-section">
              <strong>Technologies:</strong>
              <div className="tech-stack">
                {techs.map((tech, idx) => (
                  <span key={idx} className="tech-pill">{tech}</span>
                ))}
              </div>
            </div>
          );
        } else if (content.includes('Recent Engagements:') || content.includes('Focus Areas:')) {
          return <p className="resume-highlight" {...props} />;
        }
      }
      
      // Special styling for contact info line
      if (isAboutPage && 
          props.children && 
          typeof props.children === 'string' && 
          (props.children.includes('Years Experience') || 
           props.children.includes('Singapore'))) {
        return <p className="resume-contact-info" {...props} />;
      }
      
      return <p {...props} />;
    },
    
    // Style horizontal rules as section separators
    hr: ({ node, ...props }) => {
      if (isAboutPage) {
        return <hr className="resume-section-divider" {...props} />;
      }
      return <hr {...props} />;
    }
  };

  // Enhance the about page content with styled sections after rendering
  useEffect(() => {
    if (isAboutPage && contentRef.current) {
      // Add class to main container for resume styling
      contentRef.current.classList.add('resume-container', 'animate-fade-in');
      
      // Add special styling to strong elements in lists
      const listStrong = contentRef.current.querySelectorAll('li strong');
      listStrong.forEach((strong) => {
        strong.classList.add('resume-highlight-text');
      });
      
      // Add special styling to job descriptions
      const jobDescriptions = contentRef.current.querySelectorAll('h4 + p');
      jobDescriptions.forEach((desc) => {
        desc.classList.add('job-description');
      });
    }
  }, [content, isAboutPage]);

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading content...</p>
    </div>
  );

  if (error) return <div className="error-message">Error: {error}</div>;

  // Special container for the about page (homepage)
  if (isAboutPage) {
    return (
      <div className="resume-container" ref={contentRef}>
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

