// src/pages/Books.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarkdownFiles } from '../utils/MarkdownService.jsx';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBooks() {
      setIsLoading(true);
      setError(null);
      try {
        // Load both single files and directories
        const singleFiles = await getMarkdownFiles('books');
        const multiFileBooks = await loadMultiFileBooks();
        
        // Combine and sort all books
        const allBooks = [...singleFiles, ...multiFileBooks];
        setBooks(allBooks);
      } catch (err) {
        console.error('Error loading books:', err);
        setError(`Failed to load books data. ${err.message}`);
        // Fallback data
        setBooks([
          {
            id: 'sample-novel-1',
            title: '时光倒流的秘密',
            author: '张三',
            genre: '科幻小说',
            status: '连载中',
            chapters: 12
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadBooks();
  }, []);

  const loadMultiFileBooks = async () => {
    try {
      // Check for multi-file book directories
      const response = await fetch('/content/books/qingchun-xiaoyuan/index.md');
      if (response.ok) {
        const text = await response.text();
        const metadata = extractFrontmatter(text);
        return [{
          id: 'qingchun-xiaoyuan',
          isMultiFile: true,
          ...metadata
        }];
      }
    } catch (error) {
      console.log('No multi-file books found');
    }
    return [];
  };

  const extractFrontmatter = (markdown) => {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = markdown.match(frontmatterRegex);
    
    if (!match) return {};
    
    const frontmatter = match[1];
    const metadata = {};
    
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Handle special cases like arrays
      if (key === 'chapters' && value.includes('[')) {
        // Skip parsing complex chapter arrays for now
        continue;
      }
      
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

  const getReadingLink = (book) => {
    if (book.isMultiFile) {
      return `/book/${book.id}/contents`;
    }
    return `/book/${book.id}`;
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading books...</p>
    </div>
  );

  return (
    <div className="books-container">
      <div className="page-header">
        <h1 className="page-title">小说创作</h1>
        <p className="page-description">欢迎来到我的小说世界，这里收录了各种原创小说作品。</p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="books-grid">
        {books.length > 0 ? (
          books.map(book => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                <div className="book-cover-placeholder">
                  📚
                </div>
              </div>
              <div className="book-info">
                <h3 className="book-title">
                  <Link to={getReadingLink(book)}>{book.title}</Link>
                </h3>
                {book.author && <p className="book-author">作者: {book.author}</p>}
                {book.genre && <p className="book-genre">类型: {book.genre}</p>}
                {book.status && (
                  <p className={`book-status ${book.status === '已完结' ? 'completed' : 'ongoing'}`}>
                    状态: {book.status}
                  </p>
                )}
                {book.totalChapters && <p className="book-chapters">章节: {book.totalChapters}章</p>}
                {book.chapters && !book.totalChapters && <p className="book-chapters">章节: {book.chapters}章</p>}
                {book.date && <p className="book-date">更新: {formatDate(book.date)}</p>}
                {book.description && (
                  <p className="book-description">{book.description}</p>
                )}
                <div className="book-actions">
                  <Link to={getReadingLink(book)} className="btn btn-primary btn-sm">
                    {book.isMultiFile ? '查看目录' : '开始阅读'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-books">
            <p>暂无小说作品，敬请期待...</p>
          </div>
        )}
      </div>
    </div>
  );
}
