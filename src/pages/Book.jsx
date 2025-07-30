// src/pages/Book.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export default function Book() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');
  const contentRef = useRef(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const response = await fetch(`/content/books/${id}.md`);
        if (!response.ok) {
          throw new Error(`Failed to load book: ${response.status}`);
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
          const authorMatch = frontmatter.match(/author:\s*["']?(.*?)["']?(\n|$)/);
          const genreMatch = frontmatter.match(/genre:\s*["']?(.*?)["']?(\n|$)/);
          const dateMatch = frontmatter.match(/date:\s*["']?(.*?)["']?(\n|$)/);
          const statusMatch = frontmatter.match(/status:\s*["']?(.*?)["']?(\n|$)/);
          const chaptersMatch = frontmatter.match(/chapters:\s*["']?(.*?)["']?(\n|$)/);
          const descriptionMatch = frontmatter.match(/description:\s*["']?(.*?)["']?(\n|$)/);

          if (titleMatch) metadata.title = titleMatch[1].trim();
          if (authorMatch) metadata.author = authorMatch[1].trim();
          if (genreMatch) metadata.genre = genreMatch[1].trim();
          if (dateMatch) metadata.date = dateMatch[1].trim();
          if (statusMatch) metadata.status = statusMatch[1].trim();
          if (chaptersMatch) metadata.chapters = chaptersMatch[1].trim();
          if (descriptionMatch) metadata.description = descriptionMatch[1].trim();
        }

        // Remove frontmatter before setting content
        const content = text.replace(frontmatterRegex, '').trim();

        setBook({
          ...metadata,
          content: content,
          id: id
        });
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const adjustFontSize = (change) => {
    const newSize = Math.max(12, Math.min(24, fontSize + change));
    setFontSize(newSize);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading book...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h2>Error Loading Book</h2>
      <p>{error}</p>
      <Link to="/books" className="btn btn-primary">返回小说列表</Link>
    </div>
  );

  if (!book) return (
    <div className="error-container">
      <h2>Book Not Found</h2>
      <p>The requested book could not be found.</p>
      <Link to="/books" className="btn btn-primary">返回小说列表</Link>
    </div>
  );

  return (
    <div className={`book-reader ${theme}-theme`}>
      {/* Reading Controls */}
      <div className="reading-controls">
        <div className="controls-left">
          <Link to="/books" className="btn btn-sm btn-secondary">
            ← 返回列表
          </Link>
        </div>
        <div className="controls-center">
          <h2 className="book-title-header">{book.title}</h2>
        </div>
        <div className="controls-right">
          <button 
            onClick={() => adjustFontSize(-2)} 
            className="btn btn-sm"
            title="减小字体"
          >
            A-
          </button>
          <span className="font-size-display">{fontSize}px</span>
          <button 
            onClick={() => adjustFontSize(2)} 
            className="btn btn-sm"
            title="增大字体"
          >
            A+
          </button>
          <button 
            onClick={toggleTheme} 
            className="btn btn-sm"
            title="切换主题"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="book-metadata">
        <div className="metadata-grid">
          {book.author && <div className="metadata-item"><strong>作者:</strong> {book.author}</div>}
          {book.genre && <div className="metadata-item"><strong>类型:</strong> {book.genre}</div>}
          {book.status && (
            <div className="metadata-item">
              <strong>状态:</strong> 
              <span className={`status-badge ${book.status === '已完结' ? 'completed' : 'ongoing'}`}>
                {book.status}
              </span>
            </div>
          )}
          {book.chapters && <div className="metadata-item"><strong>章节:</strong> {book.chapters}章</div>}
          {book.date && <div className="metadata-item"><strong>更新:</strong> {formatDate(book.date)}</div>}
        </div>
        {book.description && (
          <div className="book-description-meta">
            <strong>简介:</strong> {book.description}
          </div>
        )}
      </div>

      {/* Book Content */}
      <div 
        className="book-content" 
        ref={contentRef}
        style={{ fontSize: `${fontSize}px` }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            h1: ({children}) => <h1 className="chapter-title">{children}</h1>,
            h2: ({children}) => <h2 className="section-title">{children}</h2>,
            h3: ({children}) => <h3 className="subsection-title">{children}</h3>,
            p: ({children}) => <p className="paragraph">{children}</p>,
            hr: () => <div className="chapter-divider">* * *</div>
          }}
        >
          {book.content}
        </ReactMarkdown>
      </div>

      {/* Reading Progress */}
      <div className="reading-footer">
        <div className="reading-info">
          <span>正在阅读: {book.title}</span>
          {book.author && <span> | 作者: {book.author}</span>}
        </div>
      </div>
    </div>
  );
}
