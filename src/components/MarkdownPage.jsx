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
        return <h1 className="rainbow-text" {...props} />;
      }
      return <h1 {...props} />;
    },
    h2: ({ node, ...props }) => {
      if (isAboutPage) {
        if (props.children[0].includes('Gen-AI')) {
          return <h2 id="gen-ai" className="gradient-heading" {...props} />;
        } else if (props.children[0].includes('Data')) {
          return <h2 id="data" className="gradient-heading" {...props} />;
        } else if (props.children[0].includes('Infrastructure')) {
          return <h2 id="infra" className="gradient-heading" {...props} />;
        } else if (props.children[0].includes('Security')) {
          return <h2 id="security" className="gradient-heading" {...props} />;
        } else if (props.children[0].includes('Wallet')) {
          return <h2 id="wallet" className="gradient-heading" {...props} />;
        } else if (props.children[0].includes('Speaker')) {
          return <h2 id="speaker" className="gradient-heading" {...props} />;
        }
      }
      return <h2 {...props} />;
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
          (props.children.includes('Flink') || 
           props.children.includes('Kubernetes') || 
           props.children.includes('SOC') || 
           props.children.includes('Digital Wallet'))) {
        
        const techs = props.children.split(',').map(tech => tech.trim());
        return (
          <div className="tech-stack">
            {techs.map((tech, idx) => (
              <span key={idx} className="tech-pill">{tech}</span>
            ))}
          </div>
        );
      }
      return <p {...props} />;
    }
  };

  // Enhance the about page content with styled sections after rendering
  useEffect(() => {
    if (isAboutPage && contentRef.current) {
      // Add class to main container
      contentRef.current.classList.add('about-container', 'animate-fade-in');
      
      // Process sections and add appropriate styling
      const sections = contentRef.current.querySelectorAll('h2[id]');
      sections.forEach((section, index) => {
        const sectionId = section.id;
        const nextSection = sections[index + 1];
        
        // Get all elements between this h2 and the next one (or the end)
        let currentElement = section.nextElementSibling;
        const sectionElements = [];
        
        while (currentElement && 
               (!nextSection || !currentElement.isSameNode(nextSection))) {
          sectionElements.push(currentElement);
          currentElement = currentElement.nextElementSibling;
        }
        
        // Create a section wrapper
        const wrapper = document.createElement('div');
        wrapper.className = `about-section ${sectionId}-section`;
        
        // For specific sections, create skill cards with icons
        if (['gen-ai', 'data', 'infra', 'security', 'wallet'].includes(sectionId)) {
          const card = document.createElement('div');
          card.className = `skill-card gradient-card ${sectionId}`;
          
          // Add animation classes based on even/odd index
          if (index % 2 === 0) {
            card.classList.add('animate-slide-left');
          } else {
            card.classList.add('animate-slide-right');
          }
          
          card.style.setProperty('--animation-order', index + 1);
          
          // Add a colorful icon based on section type
          const iconWrapper = document.createElement('div');
          iconWrapper.style.cssText = `
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-align: center;
            background: white;
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          `;
          
          // Select icon based on section
          let icon = '🤖';
          if (sectionId === 'gen-ai') {
            icon = '🤖';
            iconWrapper.style.color = 'var(--primary-purple)';
          } else if (sectionId === 'data') {
            icon = '📊';
            iconWrapper.style.color = 'var(--primary-teal)';
          } else if (sectionId === 'infra') {
            icon = '🏗️';
            iconWrapper.style.color = 'var(--primary-coral)';
          } else if (sectionId === 'security') {
            icon = '🔒';
            iconWrapper.style.color = 'var(--primary-gold)';
          } else if (sectionId === 'wallet') {
            icon = '💳';
            iconWrapper.style.color = 'var(--primary-magenta)';
          }
          
          iconWrapper.textContent = icon;
          card.appendChild(iconWrapper);
          
          // Add a title to the card
          const cardTitle = document.createElement('h3');
          cardTitle.textContent = section.textContent;
          cardTitle.className = 'gradient-heading';
          card.appendChild(cardTitle);
          
          // Move all section elements into the card
          sectionElements.forEach(el => card.appendChild(el.cloneNode(true)));
          
          // Replace the original elements with the card
          wrapper.appendChild(card);
          section.insertAdjacentElement('afterend', wrapper);
          
          // Remove the original elements
          sectionElements.forEach(el => el.remove());
          section.remove();
        } else if (sectionId === 'speaker') {
          // Special styling for speaker section
          const speakerSection = document.createElement('div');
          speakerSection.className = 'speaker-section colored-section animate-fade-up';
          
          // Keep the h2 but move it inside
          speakerSection.appendChild(section.cloneNode(true));
          
          // Add decorative elements
          const decorElement = document.createElement('div');
          decorElement.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 3rem;
            opacity: 0.2;
            display: flex;
            gap: 15px;
          `;
          decorElement.innerHTML = '🎤 🎙️ 📢';
          speakerSection.appendChild(decorElement);
          
          // Move all section elements
          sectionElements.forEach(el => speakerSection.appendChild(el.cloneNode(true)));
          
          // Replace the original elements with the styled section
          wrapper.appendChild(speakerSection);
          section.insertAdjacentElement('afterend', wrapper);
          
          // Remove the original elements
          sectionElements.forEach(el => el.remove());
          section.remove();
        }
      }); 
      
      // Add color accents to strong elements
      const strongElements = contentRef.current.querySelectorAll('p strong');
      strongElements.forEach((strong) => {
        strong.classList.add('rainbow-text');
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

