// Debug component to test message rendering
import React from 'react';
import ChatMessage from '../components/ChatMessage.jsx';

export default function MessageTest() {
  const testMessage = {
    id: 1,
    type: 'assistant',
    content: 'This is a test message to verify the UI is working correctly.',
    timestamp: new Date(),
    model: 'qwen/qwen3-coder:free'
  };

  return (
    <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
      <h2>Message Test</h2>
      <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
        <ChatMessage message={testMessage} />
      </div>
    </div>
  );
}
