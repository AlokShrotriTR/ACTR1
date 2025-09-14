// Netlify Function to proxy ServiceNow OAuth requests
exports.handler = async (event, context) => {
  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://alokshrotritr.github.io",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "3600"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ""
    };
  }

  try {
    // Parse request body
    const { endpoint, method = "POST", body, headers = {} } = JSON.parse(event.body || '{}');

    if (!endpoint) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing endpoint parameter" })
      };
    }

    // Make request to ServiceNow
    const fetch = require('node-fetch');
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        ...headers
      },
      body: body
    });

    const responseData = await response.text();
    
    // Try to parse as JSON, fallback to text
    let parsedData;
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = { data: responseData };
    }

    return {
      statusCode: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(parsedData)
    };

  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "Proxy request failed", 
        details: error.message 
      })
    };
  }
};
