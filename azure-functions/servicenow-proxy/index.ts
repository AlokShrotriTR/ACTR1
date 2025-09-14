import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    // Set CORS headers
    const corsHeaders = {
        "Access-Control-Allow-Origin": "https://alokshrotritr.github.io",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "3600"
    };

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
        context.res = {
            status: 200,
            headers: corsHeaders
        };
        return;
    }

    try {
        // Extract ServiceNow configuration from request
        const { endpoint, method = "POST", body, headers = {} } = req.body;

        if (!endpoint) {
            context.res = {
                status: 400,
                headers: corsHeaders,
                body: { error: "Missing endpoint parameter" }
            };
            return;
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

        context.res = {
            status: response.status,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            },
            body: parsedData
        };

    } catch (error) {
        context.log.error('Proxy error:', error);
        
        context.res = {
            status: 500,
            headers: corsHeaders,
            body: { 
                error: "Proxy request failed", 
                details: error.message 
            }
        };
    }
};

export default httpTrigger;
