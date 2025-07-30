// src/pages/BookContents.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export default function BookContents() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBookContents() {
      try {
        const response = await fetch(`/content/books/${bookId}/index.md`);
        if (!response.ok) {
          throw new Error(`Failed to load book: ${response.status}`);
        }

        const text = await response.text();
        const metadata = extractFrontmatter(text);
        const content = text.replace(/^---\n([\s\S]*?)\n---/, '').trim();

        setBook({
          ...metadata,
          content: content,
          id: bookId
        });

        // Extract chapters from frontmatter
        if (metadata.chapters) {
          setChapters(metadata.chapters);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadBookContents();
  }, [bookId]);

  const extractFrontmatter = (markdown) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = markdown.match(frontmatterRegex);
    
    if (!match) return {};
    
    const frontmatter = match[1];
    const metadata = {};
    
    // Parse chapters array manually
    const chaptersMatch = frontmatter.match(/chapters:\s*\n([\s\S]*?)(?=\n\w+:|$)/);
    if (chaptersMatch) {
      const chaptersText = chaptersMatch[1];
      const chapterLines = chaptersText.split('\n').filter(line => line.trim().startsWith('-'));
      
      metadata.chapters = chapterLines.map(line => {
        const match = line.match(/id:\s*["']([^"']+)["'],?\s*title:\s*["']([^"']+)["'],?\s*file:\s*["']([^"']+)["']/);
        if (match) {
          return {
            id: match[1],
            title: match[2],
            file: match[3]
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    // Parse other metadata
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      if (line.startsWith('chapters:') || line.trim().startsWith('-')) continue;
      
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }
      
      metadata[key] = value;
    }
    
    return metadata;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading book contents...</p>
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
    <div className="book-contents-container">
      {/* Header with navigation */}
      <div className="contents-header">
        <div className="header-nav">
          <Link to="/books" className="btn btn-sm btn-secondary">
            ← 返回小说列表
          </Link>
        </div>
        <h1 className="book-title">{book.title}</h1>
      </div>

      {/* Book metadata */}
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
          {book.totalChapters && <div className="metadata-item"><strong>章节:</strong> {book.totalChapters}章</div>}
          {book.date && <div className="metadata-item"><strong>更新:</strong> {formatDate(book.date)}</div>}
        </div>
        {book.description && (
          <div className="book-description-meta">
            <strong>简介:</strong> {book.description}
          </div>
        )}
      </div>

      {/* Book introduction content */}
      <div className="book-intro">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
        >
          {book.content}
        </ReactMarkdown>
      </div>

      {/* Chapter list */}
      <div className="chapters-list">
        <h2 className="chapters-title">章节目录</h2>
        <div className="chapters-grid">
          {chapters.length > 0 ? (
            chapters.map((chapter, index) => (
              <div key={chapter.id} className="chapter-item">
                <Link 
                  to={`/book/${bookId}/chapter/${chapter.id}`}
                  className="chapter-link"
                >
                  <div className="chapter-number">第{index + 1}章</div>
                  <div className="chapter-title">{chapter.title}</div>
                </Link>
              </div>
            ))
          ) : (
            <p>暂无章节内容</p>
          )}
        </div>
      </div>

      {/* Quick start reading */}
      {chapters.length > 0 && (
        <div className="quick-actions">
          <Link 
            to={`/book/${bookId}/chapter/${chapters[0].id}`}
            className="btn btn-primary btn-lg"
          >
            开始阅读第一章
          </Link>
        </div>
      )}
    </div>
  );
}
