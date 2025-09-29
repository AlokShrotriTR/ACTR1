// Proxy configuration for different deployment options
const PROXY_CONFIGS = {
  // AWS Lambda (Update this URL after deploying to AWS)
  aws: 'https://YOUR_API_GATEWAY_URL_HERE',
  // Azure Functions
  azure: 'https://actr1-servicenow-proxy.azurewebsites.net/api/servicenow-proxy',
  // Vercel
  vercel: 'https://actr1.vercel.app/api/servicenow-proxy',
  // Netlify
  netlify: 'https://actr1.netlify.app/.netlify/functions/servicenow-proxy',
  // For local testing
  local: 'http://localhost:7071/api/servicenow-proxy'
};

// Using AWS Lambda - UPDATE THIS URL AFTER DEPLOYING TO AWS
export const PROXY_URL = PROXY_CONFIGS.aws; // Will be updated after Azure deployment

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
