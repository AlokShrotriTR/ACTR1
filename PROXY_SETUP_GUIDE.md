# Server-Side Proxy Setup Guide

## Overview
This guide helps you deploy a server-side proxy to avoid CORS issues with ServiceNow OAuth. The proxy acts as an intermediary between your GitHub Pages app and ServiceNow, eliminating cross-origin restrictions.

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Step 1: Deploy to Vercel**
1. Create account at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. The `api/servicenow-proxy.js` file will automatically become an API endpoint
4. Your proxy URL will be: `https://your-app-name.vercel.app/api/servicenow-proxy`

**Step 2: Update App Configuration**
Update `src/services/proxyService.ts`:
```typescript
export const PROXY_URL = 'https://your-app-name.vercel.app/api/servicenow-proxy';
```

### Option 2: Netlify Functions

**Step 1: Deploy to Netlify**
1. Create account at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. The function will be available at: `https://your-app.netlify.app/.netlify/functions/servicenow-proxy`

**Step 2: Add netlify.toml**
```toml
[build]
  functions = "netlify/functions"
  publish = "build"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Option 3: Azure Functions (Enterprise)

**Step 1: Install Azure Functions Core Tools**
```bash
npm install -g azure-functions-core-tools@4
```

**Step 2: Deploy Function**
```bash
cd azure-functions
func azure functionapp publish your-function-app-name
```

**Step 3: Update Configuration**
```typescript
export const PROXY_URL = 'https://your-function-app.azurewebsites.net/api/servicenow-proxy';
```

## Testing the Proxy

### Test Endpoint Directly
```bash
curl -X POST https://your-proxy-url \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://dev279775.service-now.com/oauth_token.do",
    "method": "POST",
    "body": "grant_type=authorization_code&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&code=AUTH_CODE&redirect_uri=YOUR_REDIRECT_URI"
  }'
```

### Expected Response
```json
{
  "access_token": "your-access-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "your-refresh-token"
}
```

## Configuration Steps

### 1. Choose and Deploy Proxy
Pick one deployment option above and deploy your proxy service.

### 2. Update React App
Edit `src/services/proxyService.ts` with your proxy URL:
```typescript
export const PROXY_URL = 'https://your-deployed-proxy-url';
```

### 3. Build and Deploy
```bash
npm run build
git add .
git commit -m "Add server-side proxy for ServiceNow OAuth"
git push
```

### 4. Test OAuth Flow
1. Wait for GitHub Pages to deploy (2-3 minutes)
2. Open your Teams app
3. Click "Login to ServiceNow"
4. OAuth should now work without CORS errors!

## Troubleshooting

### Proxy Not Working?
- Check proxy logs in your deployment platform
- Verify the proxy URL is correct in `proxyService.ts`
- Test the proxy endpoint directly with curl/Postman

### Still Getting CORS Errors?
- Make sure you're using the proxy for ALL ServiceNow requests
- Check that the proxy is setting the correct CORS headers
- Verify your GitHub Pages domain is allowed in proxy CORS config

### Authentication Fails?
- Check ServiceNow OAuth app configuration
- Verify client ID/secret are correct
- Ensure redirect URI matches exactly

## Security Notes

- **Never expose client secrets** in frontend code (they're only used in proxy)
- **Use HTTPS** for all proxy deployments
- **Restrict CORS origins** to your specific GitHub Pages domain
- **Consider rate limiting** on your proxy endpoints

## Next Steps

1. **Deploy proxy** using one of the options above
2. **Update proxy URL** in `proxyService.ts`
3. **Test OAuth flow** in Teams app
4. **Monitor proxy usage** and performance

This proxy solution completely eliminates CORS issues and provides a secure way to handle ServiceNow OAuth authentication!
