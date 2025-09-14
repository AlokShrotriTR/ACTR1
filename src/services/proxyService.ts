// Proxy configuration for different deployment options
const PROXY_CONFIGS = {
  // Update these URLs after deploying your proxy
  vercel: 'https://actr1.vercel.app/api/servicenow-proxy',
  netlify: 'https://actr1.netlify.app/.netlify/functions/servicenow-proxy',
  azure: 'https://actr1-proxy.azurewebsites.net/api/servicenow-proxy',
  // For local testing
  local: 'http://localhost:7071/api/servicenow-proxy'
};

// Choose which proxy to use - UPDATE THIS AFTER DEPLOYING
export const PROXY_URL = PROXY_CONFIGS.vercel; // Change this to your deployed proxy

export interface ProxyRequest {
  endpoint: string;
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

export const makeProxyRequest = async (request: ProxyRequest): Promise<any> => {
  try {
    console.log(`🔄 Making proxy request to: ${PROXY_URL}`);
    console.log('📤 Request:', request);

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('📥 Proxy response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('❌ Proxy request error:', error);
    throw error;
  }
};
