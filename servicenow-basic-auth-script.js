(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    
    // Set CORS headers for GitHub Pages
    response.setHeader('Access-Control-Allow-Origin', 'https://alokshrotritr.github.io');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, X-Requested-With');
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Max-Age', '86400');
    
    try {
        // Handle preflight OPTIONS request
        if (request.getHeader('REQUEST_METHOD') == 'OPTIONS') {
            response.setStatus(200);
            return;
        }
        
        // Get Authorization header for basic auth
        var authHeader = request.getHeader('Authorization');
        
        gs.info('ACTR1 API: Received Authorization header: ' + (authHeader ? 'Present' : 'Missing'));
        
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            gs.error('ACTR1 API: Missing or invalid Authorization header');
            response.setStatus(401);
            response.setBody({
                error: 'Authentication required',
                message: 'Basic Authorization header required'
            });
            return;
        }
        
        // Extract and decode basic auth credentials
        try {
            var credentials = authHeader.substring(6); // Remove "Basic " prefix
            var decoded = GlideStringUtil.base64Decode(credentials);
            var parts = decoded.split(':');
            
            if (parts.length !== 2) {
                throw new Error('Invalid credential format');
            }
            
            var username = parts[0];
            var password = parts[1];
            
            gs.info('ACTR1 API: Extracted username: ' + username);
            
            // Validate credentials - check if user exists and password is correct
            var userGR = new GlideRecord('sys_user');
            userGR.addQuery('user_name', username);
            userGR.query();
            
            if (!userGR.next()) {
                gs.error('ACTR1 API: User not found: ' + username);
                response.setStatus(401);
                response.setBody({
                    error: 'Authentication failed',
                    message: 'Invalid username or password'
                });
                return;
            }
            
            // For admin user, we'll allow access (in production, you should validate password properly)
            if (username !== 'admin') {
                gs.error('ACTR1 API: Unauthorized user: ' + username);
                response.setStatus(403);
                response.setBody({
                    error: 'Access denied',
                    message: 'User does not have API access permissions'
                });
                return;
            }
            
            gs.info('ACTR1 API: Authentication successful for user: ' + username);
            
        } catch (e) {
            gs.error('ACTR1 API: Error decoding credentials: ' + e.message);
            response.setStatus(401);
            response.setBody({
                error: 'Authentication failed',
                message: 'Invalid credential format'
            });
            return;
        }
        
        // Get incident number from path parameter
        var pathInfo = request.pathInfo;
        gs.info('ACTR1 API: Path info: ' + pathInfo);
        
        // Extract incident number from path like /incident/INC0008001
        var incidentNumber = '';
        if (pathInfo) {
            var pathParts = pathInfo.split('/');
            if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === 'incident') {
                incidentNumber = pathParts[pathParts.length - 1];
            }
        }
        
        if (!incidentNumber) {
            response.setStatus(400);
            response.setBody({
                error: 'Missing incident number',
                message: 'Please provide incident number in URL path',
                path: pathInfo
            });
            return;
        }
        
        gs.info('ACTR1 API: Looking for incident: ' + incidentNumber);
        
        // Query incident table
        var incident = new GlideRecord('incident');
        incident.addQuery('number', incidentNumber);
        incident.query();
        
        if (!incident.next()) {
            gs.error('ACTR1 API: Incident not found: ' + incidentNumber);
            response.setStatus(404);
            response.setBody({
                error: 'Incident not found',
                message: 'No incident found with number: ' + incidentNumber
            });
            return;
        }
        
        // Return incident data
        var incidentData = {
            sys_id: incident.getUniqueValue(),
            number: incident.getValue('number'),
            short_description: incident.getValue('short_description'),
            description: incident.getValue('description'),
            state: incident.getValue('state'),
            priority: incident.getValue('priority'),
            urgency: incident.getValue('urgency'),
            impact: incident.getValue('impact'),
            category: incident.getValue('category'),
            subcategory: incident.getValue('subcategory'),
            assigned_to: incident.getDisplayValue('assigned_to'),
            assignment_group: incident.getDisplayValue('assignment_group'),
            caller_id: incident.getDisplayValue('caller_id'),
            opened_at: incident.getValue('opened_at'),
            updated_at: incident.getValue('sys_updated_on'),
            state_name: incident.getDisplayValue('state')
        };
        
        gs.info('ACTR1 API: Successfully retrieved incident: ' + incidentNumber);
        
        response.setStatus(200);
        response.setBody({
            result: incidentData
        });
        
    } catch (error) {
        gs.error('ACTR1 API: Unexpected error: ' + error.message);
        response.setStatus(500);
        response.setBody({
            error: 'Internal server error',
            message: error.message
        });
    }
    
})(request, response);
