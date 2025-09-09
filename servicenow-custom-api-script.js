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
        
        // Get client credentials from headers
        var clientId = request.getHeader('X-Client-ID');
        var clientSecret = request.getHeader('X-Client-Secret');
        
        gs.info('ACTR1 API: Received headers - Client ID: ' + clientId + ', Client Secret: ' + (clientSecret ? 'Present' : 'Missing'));
        
        if (!clientId || !clientSecret) {
            gs.error('ACTR1 API: Missing client credentials in headers');
            response.setStatus(401);
            response.setBody({
                error: 'Missing client credentials',
                message: 'X-Client-ID and X-Client-Secret headers required'
            });
            return;
        }
        
        // Validate against your OAuth application credentials
        var validClientId = 'f5128ff271732250433aeb0e714b8cae';
        var validClientSecret = 'VxgMXG`ccF';
        
        if (clientId !== validClientId || clientSecret !== validClientSecret) {
            gs.error('ACTR1 API: Invalid client credentials - ID: ' + clientId + ', Expected: ' + validClientId);
            response.setStatus(401);
            response.setBody({
                error: 'Invalid client credentials',
                message: 'Client ID or Secret is incorrect',
                received_client_id: clientId
            });
            return;
        }
        
        gs.info('ACTR1 API: Authentication successful');
        
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
        
        gs.info('ACTR1 API: Searching for incident: ' + incidentNumber);
        
        // Query incident table
        var incident = new GlideRecord('incident');
        incident.addQuery('number', incidentNumber);
        incident.query();
        
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
                authenticated: true,
                auth_method: 'custom_headers'
            });
        } else {
            gs.info('ACTR1 API: No incident found for: ' + incidentNumber);
            response.setStatus(404);
            response.setBody({
                result: [],
                error: 'Incident not found',
                incident_number: incidentNumber,
                authenticated: true
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
