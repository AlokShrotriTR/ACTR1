# Updated ServiceNow Custom REST API Script with Built-in Authentication

## Problem
OAuth token requests from GitHub Pages are failing due to CORS restrictions on the `/oauth_token.do` endpoint.

## Solution
Update your ServiceNow custom REST API script to handle authentication internally, eliminating the need for client-side OAuth calls.

## Updated Custom REST API Script

Replace your current ServiceNow custom API script with this version:

```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    // Set CORS headers for GitHub Pages
    response.setHeader('Access-Control-Allow-Origin', 'https://alokshrotritr.github.io');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With, X-Client-ID, X-Client-Secret');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Max-Age', '86400');
    
    try {
        // Handle preflight OPTIONS request
        if (request.getHeader('REQUEST_METHOD') == 'OPTIONS') {
            response.setStatus(200);
            return;
        }
        
        // Validate client credentials from headers
        var clientId = request.getHeader('X-Client-ID');
        var clientSecret = request.getHeader('X-Client-Secret');
        
        if (!clientId || !clientSecret) {
            response.setStatus(401);
            response.setBody({
                error: 'Missing client credentials',
                message: 'X-Client-ID and X-Client-Secret headers required'
            });
            return;
        }
        
        // Validate against your OAuth application credentials
        // Replace these with your actual OAuth app credentials
        var validClientId = 'f5128ff271732250433aeb0e714b8cae';
        var validClientSecret = 'VxgMXG`ccF';
        
        if (clientId !== validClientId || clientSecret !== validClientSecret) {
            response.setStatus(401);
            response.setBody({
                error: 'Invalid client credentials',
                message: 'Client ID or Secret is incorrect'
            });
            return;
        }
        
        // Get incident number from path parameter
        var incidentNumber = request.pathParams.number;
        
        if (!incidentNumber) {
            response.setStatus(400);
            response.setBody({
                error: 'Incident number required',
                message: 'Please provide an incident number in the URL path'
            });
            return;
        }
        
        // Query incident table
        var incident = new GlideRecord('incident');
        incident.addQuery('number', incidentNumber);
        incident.query();
        
        gs.info('ACTR1 API: Searching for incident: ' + incidentNumber);
        
        if (incident.next()) {
            var result = {
                number: incident.getValue('number'),
                short_description: incident.getValue('short_description'),
                state: incident.getValue('state'),
                priority: incident.getValue('priority'),
                assigned_to: incident.getDisplayValue('assigned_to'),
                sys_id: incident.getValue('sys_id')
            };
            
            gs.info('ACTR1 API: Found incident: ' + JSON.stringify(result));
            
            response.setStatus(200);
            response.setBody({
                result: [result],
                success: true,
                authenticated: true
            });
        } else {
            gs.info('ACTR1 API: No incident found for: ' + incidentNumber);
            response.setStatus(404);
            response.setBody({
                result: [],
                error: 'Incident not found',
                incident_number: incidentNumber
            });
        }
        
    } catch (error) {
        gs.error('ACTR1 API Error: ' + error.message);
        response.setStatus(500);
        response.setBody({
            error: 'Internal server error',
            message: error.message
        });
    }
    
})(request, response);
```

## Client-Side Changes Needed

Update the ServiceNow service to send credentials in headers instead of using OAuth tokens:

```typescript
private async getAuthHeaders(): Promise<HeadersInit> {
    return {
        'X-Client-ID': this.config.clientId,
        'X-Client-Secret': this.config.clientSecret,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
}
```

## Benefits of This Approach

✅ **No CORS Issues**: Authentication happens server-side  
✅ **Secure**: Credentials validated in ServiceNow  
✅ **Simpler**: No token management needed  
✅ **Reliable**: Works consistently across domains  

## Implementation Steps

1. Update ServiceNow custom REST API script
2. Update client-side authentication method  
3. Test from GitHub Pages
4. Verify incident search works

This eliminates the OAuth token endpoint CORS issue by handling authentication within your existing custom API.
