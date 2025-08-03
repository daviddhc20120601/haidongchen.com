// src/pages/LLMAgents.jsx
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from '../components/ChatMessage.jsx';
import ApiSelector from '../components/ApiSelector.jsx';

export default function LLMAgents() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with various tasks using different AI models. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState('openrouter');
  const [selectedModel, setSelectedModel] = useState('qwen/qwen3-coder:free');
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const apiConfigs = {
    openrouter: {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        'qwen/qwen3-coder:free',
        'anthropic/claude-3.5-sonnet',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'google/gemini-pro-1.5',
        'meta-llama/llama-3.1-405b-instruct',
        'microsoft/phi-3-medium-128k-instruct',
        'deepseek/deepseek-r1-0528:free',
        'deepseek/deepseek-chat-v3-0324:free'
      ],
      headers: (key) => ({
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Academic Pages LLM Chat',
        'Content-Type': 'application/json'
      })
    },
    deepseek: {
      url: 'https://api.deepseek.com/chat/completions',
      models: [
        'deepseek-chat',
        'deepseek-coder'
      ],
      headers: (key) => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      })
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!apiKey.trim()) {
      alert(`Please enter your ${selectedApi === 'openrouter' ? 'OpenRouter' : 'DeepSeek'} API key`);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const config = apiConfigs[selectedApi];
      const response = await fetch(config.url, {
        method: 'POST',
        headers: config.headers(apiKey),
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            ...messages.filter(m => m.type !== 'system').map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            { role: 'user', content: inputMessage }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        model: selectedModel
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you with various tasks using different AI models. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="llm-agents-container">
      <div className="chat-header">
        <h1>LLM Agents Chat</h1>
        <p>Interactive AI chat powered by OpenRouter and DeepSeek APIs</p>
      </div>

      <ApiSelector
        selectedApi={selectedApi}
        selectedModel={selectedModel}
        apiKey={apiKey}
        onApiChange={setSelectedApi}
        onModelChange={setSelectedModel}
        onApiKeyChange={setApiKey}
        apiConfigs={apiConfigs}
      />

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">
                <div className="assistant-avatar">AI</div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className="message-input"
              rows="3"
              disabled={isLoading}
            />
            <div className="input-actions">
              <button
                onClick={clearChat}
                className="clear-button"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
