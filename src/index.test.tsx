import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple test component
const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ACTR1 Test Page</h1>
      <p>If you can see this, React is working!</p>
      <p>GitHub Pages deployment successful.</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
