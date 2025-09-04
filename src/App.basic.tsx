import React from 'react';

export const App: React.FC = () => {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#0078d4', marginBottom: '20px' }}>
        🚀 ACTR1 Major Incident Reporting
      </h1>
      
      <div style={{ 
        backgroundColor: '#f3f2f1', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#323130', marginTop: '0' }}>✅ System Status</h2>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>✅ GitHub Pages: Deployed</li>
          <li>✅ React: Loaded</li>
          <li>✅ Webpack: Built successfully</li>
          <li>✅ UI: Rendering correctly</li>
        </ul>
      </div>

      <div style={{ 
        border: '2px solid #0078d4', 
        padding: '20px', 
        borderRadius: '8px',
        backgroundColor: '#ffffff'
      }}>
        <h3 style={{ marginTop: '0', color: '#323130' }}>📋 Major Incident Input</h3>
        <p style={{ marginBottom: '15px' }}>
          Enter incident numbers in the format <strong>INC1234567</strong>
        </p>
        
        <input 
          type="text" 
          placeholder="INC1234567"
          style={{
            width: '200px',
            padding: '8px 12px',
            border: '1px solid #605e5c',
            borderRadius: '4px',
            fontSize: '14px',
            marginRight: '10px'
          }}
        />
        
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#0078d4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
          onClick={() => alert('Search functionality working!')}
        >
          🔍 Search Incident
        </button>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#d1ecf1',
        borderRadius: '4px',
        border: '1px solid #bee5eb'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>📢 Next Steps</h4>
        <p style={{ margin: '0', fontSize: '14px', color: '#0c5460' }}>
          This basic version is working! Now we can incrementally add:
          <br />• ServiceNow integration
          <br />• Fluent UI components
          <br />• Teams SDK integration
        </p>
      </div>

      <footer style={{ 
        marginTop: '40px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#605e5c' 
      }}>
        ACTR1 Teams Application • GitHub Pages Deployment • {new Date().toLocaleString()}
      </footer>
    </div>
  );
};
