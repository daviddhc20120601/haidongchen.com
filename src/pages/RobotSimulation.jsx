// src/pages/RobotSimulation.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

/**
 * 机器人仿真详情页面组件
 * 
 * 功能：
 * - 根据URL参数加载对应的机器人仿真博客Markdown文件
 * - 解析frontmatter元数据（标题、日期、类型、模拟器等）
 * - 渲染Markdown内容，支持代码高亮、表格、Mermaid图表等
 */
export default function RobotSimulation() {
  const { id } = useParams();
  const [simulation, setSimulation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    async function fetchSimulation() {
      try {
        const response = await fetch(`/content/robot-simulations/${id}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load robot simulation: ${response.status}`);
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
          const typeMatch = frontmatter.match(/type:\s*["']?(.*?)["']?(\n|$)/);
          const simulatorMatch = frontmatter.match(/simulator:\s*["']?(.*?)["']?(\n|$)/);
          const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);

          if (titleMatch) metadata.title = titleMatch[1].trim();
          if (dateMatch) metadata.date = dateMatch[1].trim();
          if (typeMatch) metadata.type = typeMatch[1].trim();
          if (simulatorMatch) metadata.simulator = simulatorMatch[1].trim();
          if (tagsMatch) {
            metadata.tags = tagsMatch[1].split(',').map(tag => tag.trim().replace(/["']/g, ''));
          }
        }

        // Remove frontmatter before setting content
        const contentWithoutFrontmatter = text.replace(frontmatterRegex, '');

        setSimulation({
          ...metadata,
          content: contentWithoutFrontmatter
        });
      } catch (err) {
        console.error('Error loading robot simulation:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSimulation();
  }, [id]);

  // Dynamically import and render mermaid only when mermaid blocks are present
  useEffect(() => {
    if (simulation?.content && contentRef.current) {
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
              console.warn('mermaid.run failed in RobotSimulation.jsx', err);
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
                console.error('mermaid fallback render failed', err);
              }
            }
          });
        } catch (err) {
          console.error('Error loading mermaid in RobotSimulation.jsx:', err);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [simulation]);

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
      <p>Loading robot simulation...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <Link to="/robot-simulations" className="btn">Back to Robot Simulations</Link>
    </div>
  );

  if (!simulation) return (
    <div className="error-container">
      <p>Robot simulation not found</p>
      <Link to="/robot-simulations" className="btn">Back to Robot Simulations</Link>
    </div>
  );

  return (
    <div className="simulation-detail-container">
      <div className="simulation-header">
        <Link to="/robot-simulations" className="back-link">← Back to Robot Simulations</Link>
        <h1 className="simulation-title">{simulation.title}</h1>
        <div className="simulation-meta">
          {simulation.date && <span className="meta-item">📅 {formatDate(simulation.date)}</span>}
          {simulation.type && <span className="meta-item">📝 {simulation.type}</span>}
          {simulation.simulator && <span className="meta-item">🤖 {simulation.simulator}</span>}
        </div>
        {simulation.tags && simulation.tags.length > 0 && (
          <div className="simulation-tags">
            {simulation.tags.map((tag, idx) => (
              <span key={idx} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div ref={contentRef} className="simulation-content markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : null;

              if (!inline && lang === 'mermaid') {
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
            a({ node, href, children, ...props }) {
              const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'));
              return (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  {...props}
                >
                  {children}
                </a>
              );
            }
          }}
        >
          {simulation.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
