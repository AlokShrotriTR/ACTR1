# ServiceNow CORS Configuration Guide

## To Enable CORS for Your ServiceNow Instance:

### Method 1: Configure CORS in ServiceNow
1. Log into your ServiceNow instance as admin
2. Navigate to **System Web Services > REST > CORS Rules**
3. Create a new CORS rule with these settings:
   - **Name**: ACTR1 Teams App
   - **REST API**: Select your REST API (or leave blank for all)
   - **Domain**: https://alokshrotritr.github.io
   - **Additional Domain**: https://localhost:3000 (for local testing)
   - **Max Age**: 86400
   - **HTTP Methods**: GET, POST, PUT, DELETE, OPTIONS
   - **HTTP Headers**: Content-Type, Authorization, Accept
   - **Allow Credentials**: true

### IMPORTANT: Add Both Domains
- **GitHub Pages**: https://alokshrotritr.github.io
- **Local Development**: https://localhost:3000

### Method 2: Alternative - Use ServiceNow Application Registry
1. Go to **System OAuth > Application Registry**
2. Create a new **Connect to a third party OAuth Provider**
3. Configure OAuth settings for secure API access

### Method 3: Backend Proxy (Recommended for Production)
Create a backend service that:
- Accepts requests from your Teams app
- Makes ServiceNow API calls server-side
- Returns data to your Teams app
- Handles authentication securely

## Current ServiceNow Configuration:
- Instance: https://dev279775.service-now.com
- Username: admin
- API Endpoint: /api/now/table/incident

## Testing Steps:
1. Apply CORS configuration for https://alokshrotritr.github.io
2. Wait for GitHub Pages deployment to complete
3. Test API call from https://alokshrotritr.github.io/ACTR1/
4. Verify incident data retrieval
5. Test TRT call triggering

## GitHub Pages Testing URL:
https://alokshrotritr.github.io/ACTR1/
