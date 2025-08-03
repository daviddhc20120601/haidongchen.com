// src/components/ApiSelector.jsx
import React, { useState } from 'react';

export default function ApiSelector({
  selectedApi,
  selectedModel,
  apiKey,
  onApiChange,
  onModelChange,
  onApiKeyChange,
  apiConfigs
}) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="api-selector">
      <div className="api-controls">
        <div className="control-group">
          <label htmlFor="api-select">API Provider:</label>
          <select
            id="api-select"
            value={selectedApi}
            onChange={(e) => onApiChange(e.target.value)}
            className="api-select"
          >
            <option value="openrouter">OpenRouter</option>
            <option value="deepseek">DeepSeek</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="model-select">Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="model-select"
          >
            {apiConfigs[selectedApi].models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group api-key-group">
          <label htmlFor="api-key">API Key:</label>
          <div className="api-key-input-wrapper">
            <input
              id="api-key"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={`Enter your ${selectedApi === 'openrouter' ? 'OpenRouter' : 'DeepSeek'} API key`}
              className="api-key-input"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="show-key-button"
              title={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              {showApiKey ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <div className="api-key-info">
            {selectedApi === 'openrouter' ? (
              <small>
                Get your API key at{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  openrouter.ai/keys
                </a>
              </small>
            ) : (
              <small>
                Get your API key at{' '}
                <a 
                  href="https://platform.deepseek.com/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  platform.deepseek.com/api_keys
                </a>
              </small>
            )}
          </div>
        </div>
      </div>

      <div className="api-info">
        <div className="info-section">
          <h4>Current Configuration:</h4>
          <p><strong>Provider:</strong> {selectedApi === 'openrouter' ? 'OpenRouter' : 'DeepSeek'}</p>
          <p><strong>Model:</strong> {selectedModel}</p>
          <p><strong>API Key:</strong> {apiKey ? '••••••••' : 'Not set'}</p>
        </div>
        
        <div className="info-section">
          <h4>About {selectedApi === 'openrouter' ? 'OpenRouter' : 'DeepSeek'}:</h4>
          {selectedApi === 'openrouter' ? (
            <p>
              OpenRouter provides access to multiple AI models through a single API. 
              It offers models from OpenAI, Anthropic, Google, Meta, and more.
            </p>
          ) : (
            <p>
              DeepSeek is a Chinese AI company that provides powerful language models 
              optimized for coding and reasoning tasks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
