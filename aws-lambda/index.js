const https = require('https');
const querystring = require('querystring');

/**
 * AWS Lambda function to proxy ServiceNow OAuth requests
 * Handles CORS and bypasses browser security restrictions
 */
exports.handler = async (event, context) => {
    console.log('📥 Received request:', JSON.stringify(event, null, 2));
    
    // Configure CORS headers for GitHub Pages
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://alokshrotritr.github.io',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
    };
    
    try {
        // Handle preflight OPTIONS request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        // Parse the request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body || '{}');
        } catch (parseError) {
            console.error('❌ Failed to parse request body:', parseError);
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Invalid JSON in request body',
                    details: parseError.message 
                })
            };
        }
        
        const { endpoint, method = 'GET', body: proxyBody, headers: proxyHeaders = {} } = requestBody;
        
        if (!endpoint) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ 
                    error: 'Missing endpoint parameter',
                    example: {
                        endpoint: 'https://dev279775.service-now.com/oauth_token.do',
                        method: 'POST',
                        body: 'grant_type=authorization_code&...',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }
                })
            };
        }
        
        console.log('🎯 Proxying request to:', endpoint);
        console.log('📋 Method:', method);
        console.log('📝 Headers:', proxyHeaders);
        
        // Make the request to ServiceNow
        const serviceNowResponse = await makeHttpsRequest(endpoint, {
            method,
            headers: proxyHeaders,
            body: proxyBody
        });
        
        console.log('✅ ServiceNow response status:', serviceNowResponse.statusCode);
        
        // Return the ServiceNow response
        return {
            statusCode: serviceNowResponse.statusCode,
            headers: {
                ...corsHeaders,
                'Content-Type': serviceNowResponse.headers['content-type'] || 'application/json'
            },
            body: serviceNowResponse.body
        };
        
    } catch (error) {
        console.error('❌ Lambda function error:', error);
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};

/**
 * Makes HTTPS request to ServiceNow
 */
function makeHttpsRequest(url, options) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: 30000 // 30 second timeout
        };
        
        console.log('🌐 Making HTTPS request:', requestOptions);
        
        const req = https.request(requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('📨 Response received, length:', data.length);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ HTTPS request error:', error);
            reject(error);
        });
        
        req.on('timeout', () => {
            console.error('❌ Request timeout');
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        // Send request body if provided
        if (options.body) {
            console.log('📤 Sending body:', options.body);
            req.write(options.body);
        }
        
        req.end();
    });
}
