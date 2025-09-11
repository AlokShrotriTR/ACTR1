# ServiceNow CORS Configuration for OAuth

## Problem
The OAuth authentication flow is failing with this error:
```
Access to fetch at 'https://dev279775.service-now.com/oauth_token.do' from origin 'https://alokshrotritr.github.io' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause
ServiceNow's OAuth token endpoint (`oauth_token.do`) blocks cross-origin requests by default. Even though OAuth authorization works (popup opens), the token exchange step fails due to CORS restrictions.

## Solution Options

### Option 1: Configure CORS in ServiceNow (Recommended)

**Prerequisites:** ServiceNow administrator access

**Steps:**
1. **Navigate to CORS Rules**
   - Log into ServiceNow: `https://dev279775.service-now.com`
   - Go to: **System Web Services > REST > CORS Rules**
   - Click **New**

2. **Create CORS Rule**
   ```
   Name: GitHub Pages OAuth Access
   Domain: https://alokshrotritr.github.io
   Max Age: 3600
   
   HTTP Methods:
   ☑ GET
   ☑ POST  
   ☑ OPTIONS
   
   HTTP Headers:
   - Content-Type
   - Authorization
   - X-Requested-With
   - Accept
   ```

3. **Update OAuth Application**
   - Go to: **System OAuth > Application Registry**
   - Find OAuth app with Client ID: `f5128ff271732250433aeb0e714b8cae`
   - Update **Redirect URL** to: `https://alokshrotritr.github.io/ACTR1/oauth-callback.html`
   - Save changes

4. **Enable Global CORS (if needed)**
   - Go to: **System Properties > Security**
   - Set `glide.rest.cors.enabled` = `true`
   - Set `glide.cors.max_age` = `3600`

### Option 2: Use Basic Authentication (Temporary Workaround)

If you cannot configure CORS immediately, switch back to Basic Authentication:

1. Use `App.basic.tsx` instead of `App.clean.tsx`
2. Basic Auth works without CORS issues
3. Less secure but functional for development/testing

### Option 3: Server-Side Proxy (Advanced)

Create a proxy server to handle OAuth token exchange:
- Deploy proxy to Azure Functions, AWS Lambda, or similar
- Proxy handles ServiceNow OAuth on server-side
- Avoids browser CORS restrictions

## Testing the Fix

After configuring CORS:
1. Wait 5-10 minutes for changes to take effect
2. Clear browser cache
3. Try OAuth login again in the Teams app
4. Check browser console for any remaining errors

## Troubleshooting

**Still getting CORS errors?**
- Verify the domain in CORS rule matches exactly: `https://alokshrotritr.github.io`
- Check that all required HTTP methods are enabled
- Ensure `glide.rest.cors.enabled` system property is `true`
- Try creating separate CORS rules for OAuth endpoints specifically

**Don't have ServiceNow admin access?**
- Contact your ServiceNow administrator
- Share this document with them
- Request CORS configuration for OAuth endpoints

## Current Status

- ✅ OAuth authorization (popup) - Working
- ❌ OAuth token exchange - Blocked by CORS
- ✅ OAuth callback page - Working (no more 404)
- ✅ Basic Auth fallback - Available if needed

## Contact

For additional support with ServiceNow CORS configuration, consult:
- ServiceNow documentation on CORS
- Your ServiceNow system administrator
- ServiceNow community forums
