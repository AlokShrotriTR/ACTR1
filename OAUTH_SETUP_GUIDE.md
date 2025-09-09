# ServiceNow OAuth Setup Guide

## 🔐 Setting up OAuth Application in ServiceNow

### Step 1: Create OAuth Application

1. **Navigate to**: System OAuth > Application Registry
2. **Click**: New > Create an OAuth API endpoint for external clients
3. **Fill in the details**:
   ```
   Name: ACTR1 Teams Application
   Client ID: (auto-generated - copy this)
   Client Secret: (auto-generated - copy this) 
   Redirect URL: https://alokshrotritr.github.io/ACTR1/
   ```

4. **Advanced Settings**:
   ```
   Active: ✓ (checked)
   Refresh Token Lifespan: 7776000 (90 days)
   Access Token Lifespan: 1800 (30 minutes)
   ```

### Step 2: Configure Application Scope

1. **In the OAuth Application record**:
   - Go to "OAuth Entity Scopes" related list
   - Add new scope: `useraccount`
   - This allows the application to access user account information

### Step 3: Test OAuth Token Endpoint

Test the OAuth configuration using curl:

```bash
curl -X POST "https://dev279775.service-now.com/oauth_token.do" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

Expected response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...",
  "scope": "useraccount",
  "token_type": "Bearer",
  "expires_in": 1800
}
```

### Step 4: Update Environment Variables

1. **Copy the Client ID and Client Secret** from ServiceNow
2. **Update your .env file**:
   ```bash
   REACT_APP_SERVICENOW_INSTANCE=https://dev279775.service-now.com
   REACT_APP_SERVICENOW_CLIENT_ID=your-actual-client-id
   REACT_APP_SERVICENOW_CLIENT_SECRET=your-actual-client-secret
   ```

### Step 5: Grant Permissions

Ensure the OAuth application has access to incident table:

1. **Navigate to**: System Security > Access Control (ACL)
2. **Find**: incident table ACLs
3. **Ensure**: OAuth applications can read incident records

### Step 6: CORS Configuration (if needed)

Add OAuth token endpoint to CORS rules:

1. **Navigate to**: System Web Services > REST > CORS Rules
2. **Create new rule**:
   ```
   Name: OAuth Token Endpoint
   Domain: https://alokshrotritr.github.io
   Max Age: 3600
   HTTP Methods: POST,OPTIONS
   ```

## 🧪 Testing OAuth Integration

### Test 1: Token Request
```javascript
const response = await fetch('https://dev279775.service-now.com/oauth_token.do', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'grant_type=client_credentials&client_id=YOUR_ID&client_secret=YOUR_SECRET'
});
```

### Test 2: API Call with Bearer Token
```javascript
const response = await fetch('https://dev279775.service-now.com/api/now/table/incident', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Content-Type': 'application/json'
  }
});
```

## 🔒 Security Benefits

✅ **More Secure**: No hardcoded passwords  
✅ **Token Expiry**: Automatic token refresh  
✅ **Scope Limited**: Only access needed resources  
✅ **Auditable**: Better logging and tracking  
✅ **Revokable**: Can revoke access without password change  

## 🚨 Important Notes

- **Client Secret**: Keep this secure, don't commit to git
- **Token Caching**: App automatically handles token refresh
- **HTTPS Required**: OAuth requires secure connections
- **Scope Management**: Only request minimum required permissions

## 📋 Checklist

- [ ] OAuth application created in ServiceNow
- [ ] Client ID and Secret copied
- [ ] Environment variables updated
- [ ] CORS rules configured (if needed)
- [ ] Permissions granted for incident access
- [ ] Token endpoint tested successfully
- [ ] Application rebuilt with new credentials
