// src/components/ChatMessage.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessage({ message }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`message ${message.type} ${message.isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {message.type === 'user' ? (
          <div className="user-avatar">You</div>
        ) : (
          <div className="assistant-avatar">AI</div>
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-role">
            {message.type === 'user' ? 'You' : 'Assistant'}
          </span>
          {message.model && (
            <span className="message-model">({message.model})</span>
          )}
          <span className="message-time">{formatTime(message.timestamp)}</span>
        </div>
        <div className="message-text">
          {message.type === 'user' ? (
            <div className="user-message-text">{message.content}</div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <pre className="code-block">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code className="inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="markdown-blockquote">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="table-wrapper">
                    <table className="markdown-table">{children}</table>
                  </div>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
