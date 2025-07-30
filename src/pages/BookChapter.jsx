// src/pages/BookChapter.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export default function BookChapter() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState('light');
  const contentRef = useRef(null);

  useEffect(() => {
    async function loadChapter() {
      try {
        // First load the book metadata
        const bookResponse = await fetch(`/content/books/${bookId}/index.md`);
        if (!bookResponse.ok) {
          throw new Error(`Failed to load book: ${bookResponse.status}`);
        }

        const bookText = await bookResponse.text();
        const bookMetadata = extractFrontmatter(bookText);
        
        setBook({
          ...bookMetadata,
          id: bookId
        });

        // Extract chapters list
        const chaptersList = bookMetadata.chapters || [];
        setChapters(chaptersList);

        // Find current chapter index
        const chapterIndex = chaptersList.findIndex(ch => ch.id === chapterId);
        setCurrentChapterIndex(chapterIndex);

        if (chapterIndex === -1) {
          throw new Error('Chapter not found');
        }

        // Load the specific chapter content
        const chapterFile = chaptersList[chapterIndex].file;
        const chapterResponse = await fetch(`/content/books/${bookId}/${chapterFile}`);
        if (!chapterResponse.ok) {
          throw new Error(`Failed to load chapter: ${chapterResponse.status}`);
        }

        const chapterText = await chapterResponse.text();
        const chapterMetadata = extractFrontmatter(chapterText);
        const content = chapterText.replace(/^---\n([\s\S]*?)\n---/, '').trim();

        setChapter({
          ...chapterMetadata,
          content: content,
          id: chapterId
        });

      } catch (err) {
        console.error('Error fetching chapter:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadChapter();
  }, [bookId, chapterId]);

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

  const adjustFontSize = (change) => {
    const newSize = Math.max(12, Math.min(24, fontSize + change));
    setFontSize(newSize);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      navigate(`/book/${bookId}/chapter/${prevChapter.id}`);
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      navigate(`/book/${bookId}/chapter/${nextChapter.id}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && currentChapterIndex > 0) {
        goToPreviousChapter();
      } else if (event.key === 'ArrowRight' && currentChapterIndex < chapters.length - 1) {
        goToNextChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentChapterIndex, chapters.length]);

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading chapter...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <h2>Error Loading Chapter</h2>
      <p>{error}</p>
      <Link to={`/book/${bookId}/contents`} className="btn btn-primary">返回目录</Link>
    </div>
  );

  if (!chapter || !book) return (
    <div className="error-container">
      <h2>Chapter Not Found</h2>
      <p>The requested chapter could not be found.</p>
      <Link to={`/book/${bookId}/contents`} className="btn btn-primary">返回目录</Link>
    </div>
  );

  const currentChapter = chapters[currentChapterIndex];
  const hasNextChapter = currentChapterIndex < chapters.length - 1;
  const hasPrevChapter = currentChapterIndex > 0;

  return (
    <div className={`book-reader ${theme}-theme`}>
      {/* Reading Controls */}
      <div className="reading-controls">
        <div className="controls-left">
          <Link to="/books" className="btn btn-sm btn-secondary">
            ← 所有小说
          </Link>
          <Link to={`/book/${bookId}/contents`} className="btn btn-sm btn-secondary">
            📖 目录
          </Link>
        </div>
        <div className="controls-center">
          <h2 className="book-title-header">
            {book.title} - {currentChapter?.title}
          </h2>
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

      {/* Chapter Navigation */}
      <div className="chapter-navigation">
        <div className="nav-left">
          {hasPrevChapter && (
            <button 
              onClick={goToPreviousChapter}
              className="btn btn-sm btn-secondary"
              title="上一章 (←)"
            >
              ← 上一章
            </button>
          )}
        </div>
        <div className="nav-center">
          <span className="chapter-progress">
            第{currentChapterIndex + 1}章 / 共{chapters.length}章
          </span>
        </div>
        <div className="nav-right">
          {hasNextChapter && (
            <button 
              onClick={goToNextChapter}
              className="btn btn-sm btn-secondary"
              title="下一章 (→)"
            >
              下一章 →
            </button>
          )}
        </div>
      </div>

      {/* Chapter Metadata */}
      <div className="chapter-metadata">
        <h1 className="chapter-main-title">{chapter.chapterTitle}</h1>
        <div className="chapter-info">
          {chapter.date && <span>发布: {new Date(chapter.date).toLocaleDateString('zh-CN')}</span>}
          {chapter.wordCount && <span>字数: {chapter.wordCount}字</span>}
        </div>
      </div>

      {/* Chapter Content */}
      <div 
        className="chapter-content" 
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
          {chapter.content}
        </ReactMarkdown>
      </div>

      {/* Bottom Navigation */}
      <div className="chapter-bottom-nav">
        <div className="bottom-nav-left">
          {hasPrevChapter && (
            <button onClick={goToPreviousChapter} className="btn btn-secondary">
              ← {chapters[currentChapterIndex - 1]?.title}
            </button>
          )}
        </div>
        <div className="bottom-nav-center">
          <Link to={`/book/${bookId}/contents`} className="btn btn-outline">
            返回目录
          </Link>
        </div>
        <div className="bottom-nav-right">
          {hasNextChapter && (
            <button onClick={goToNextChapter} className="btn btn-secondary">
              {chapters[currentChapterIndex + 1]?.title} →
            </button>
          )}
        </div>
      </div>

      {/* Reading Progress */}
      <div className="reading-footer">
        <div className="reading-info">
          <span>正在阅读: {book.title} - {currentChapter?.title}</span>
          {book.author && <span> | 作者: {book.author}</span>}
        </div>
        <div className="reading-tips">
          <small>提示: 使用 ← → 方向键可以快速切换章节</small>
        </div>
      </div>
    </div>
  );
}
