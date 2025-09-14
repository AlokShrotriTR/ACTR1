// Vercel API Route to proxy ServiceNow OAuth requests
export default async function handler(req, res) {
  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://alokshrotritr.github.io",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "3600"
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader(...Object.entries(corsHeaders)).end();
  }

  try {
    const { endpoint, method = "POST", body, headers = {} } = req.body;

    if (!endpoint) {
      return res.status(400).setHeader(...Object.entries(corsHeaders)).json({ 
        error: "Missing endpoint parameter" 
      });
    }

    // Make request to ServiceNow
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

    // Set response headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.setHeader("Content-Type", "application/json");

    return res.status(response.status).json(parsedData);

  } catch (error) {
    console.error('Proxy error:', error);
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    return res.status(500).json({ 
      error: "Proxy request failed", 
      details: error.message 
    });
  }
}
