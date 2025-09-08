# ServiceNow CORS Setup Guide for ACTR1

## Current Issue
CORS error when accessing ServiceNow API from GitHub Pages:
```
Access to fetch at 'https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=INC0007001&sysparm_fields=number,short_description,state,priority,assigned_to,sys_id' from origin 'https://alokshrotritr.github.io' has been blocked by CORS policy
```

## Solution 1: System Properties (Recommended)

### Steps:
1. **Login to ServiceNow Admin**
   - URL: https://dev279775.service-now.com
   - Username: admin
   - Password: [your-password]

2. **Navigate to System Properties**
   - Go to: System Definition > System Properties
   - Click "New" to create each property if they don't exist

3. **Create CORS Properties Manually**
   
   **Property 1:**
   ```
   Name: glide.rest.cors.enabled
   Type: true/false
   Value: true
   Description: Enable CORS for REST APIs
   ```

   **Property 2:**
   ```
   Name: glide.rest.cors.allowed_origins
   Type: string
   Value: https://alokshrotritr.github.io,https://localhost:3000
   Description: Allowed origins for CORS requests
   ```

   **Property 3:**
   ```
   Name: glide.rest.cors.allowed_headers
   Type: string
   Value: Authorization,Content-Type,Accept,X-Requested-With
   Description: Allowed headers for CORS requests
   ```

   **Property 4:**
   ```
   Name: glide.rest.cors.allowed_methods
   Type: string
   Value: GET,POST,PUT,DELETE,OPTIONS
   Description: Allowed HTTP methods for CORS
   ```

4. **Clear Cache After Creating Properties**
   - Go to: System Definition > Cache Administration
   - Click "Flush All"

## Solution 2: CORS Rules Table

### Steps:
1. **Navigate to CORS Rules**
   - System Web Services > REST > CORS Rules

2. **Create New Rule**
   ```
   Name: ACTR1 GitHub Pages Access
   Domain: https://alokshrotritr.github.io
   Max Age: 3600
   HTTP Methods: GET,POST,PUT,DELETE,OPTIONS
   HTTP Headers: Authorization,Content-Type,Accept,X-Requested-With
   Allow Credentials: true
   Active: true
   ```

   **Note**: If you don't see "HTTP Headers" field, look for:
   - "Allowed Headers"
   - "Access Control Allow Headers" 
   - "Headers" field
   - Or it might be configured automatically

3. **Alternative CORS Rule Configuration (if HTTP Headers field is missing)**
   ```
   Name: ACTR1 GitHub Pages Access
   Domain: https://alokshrotritr.github.io
   Max Age: 3600
   Methods: GET,POST,PUT,DELETE,OPTIONS
   Allow Credentials: ✓ (checked)
   Active: ✓ (checked)
   ```

4. **Add Local Development Rule**
   ```
   Name: ACTR1 Local Development
   Domain: https://localhost:3000
   Max Age: 3600
   Methods: GET,POST,PUT,DELETE,OPTIONS
   Allow Credentials: ✓ (checked)
   Active: ✓ (checked)
   ```

## Solution 3: Proxy Server (Alternative)

If you cannot modify ServiceNow CORS settings, create a proxy server:

### Using Netlify Functions:
```javascript
// netlify/functions/servicenow-proxy.js
exports.handler = async (event, context) => {
  const { incidentNumber } = JSON.parse(event.body);
  
  const response = await fetch(`https://dev279775.service-now.com/api/now/table/incident?sysparm_query=number=${incidentNumber}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from('admin:password').toString('base64')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://alokshrotritr.github.io',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(data)
  };
};
```

## Testing After CORS Setup

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5) the GitHub Pages site

2. **Test with Sample Incident**
   - Enter: INC0007001
   - Should now fetch real data from ServiceNow

3. **Check Browser Console**
   - Should see successful API calls
   - No more CORS errors

## Verification Commands

Test CORS from command line:
```bash
curl -H "Origin: https://alokshrotritr.github.io" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization,Content-Type" \
     -X OPTIONS \
     https://dev279775.service-now.com/api/now/table/incident
```

Expected response should include:
```
Access-Control-Allow-Origin: https://alokshrotritr.github.io
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: Authorization,Content-Type
```

## Security Notes

- Only add trusted domains to CORS allowed origins
- Use HTTPS for all origins
- Consider using OAuth instead of basic authentication for production
- Regularly review and audit CORS rules

## Troubleshooting

### Common Issues:
1. **Property not found**: Create the property manually in System Properties
2. **Changes not taking effect**: Clear ServiceNow cache and restart browser
3. **Still getting CORS errors**: Check browser network tab for exact error details
4. **Authentication issues**: Verify credentials in .env file

### ServiceNow Cache Clear:
- Navigate to: System Definition > Cache Administration
- Click "Flush All" or specific cache types
