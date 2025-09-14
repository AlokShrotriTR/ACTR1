# Azure Functions Deployment Guide for ServiceNow OAuth Proxy

## Prerequisites

1. **Azure Account**: Ensure you have an Azure subscription
2. **Azure CLI**: Install Azure CLI from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
3. **Azure Functions Core Tools**: Already installed

## Step 1: Login to Azure

```bash
az login
```

This will open a browser window for authentication.

## Step 2: Create Resource Group

```bash
az group create --name "actr1-proxy-rg" --location "East US"
```

## Step 3: Create Storage Account

```bash
az storage account create ^
  --name "actr1proxystorage" ^
  --location "East US" ^
  --resource-group "actr1-proxy-rg" ^
  --sku "Standard_LRS"
```

## Step 4: Create Function App

```bash
az functionapp create ^
  --resource-group "actr1-proxy-rg" ^
  --consumption-plan-location "East US" ^
  --runtime "node" ^
  --runtime-version "18" ^
  --functions-version "4" ^
  --name "actr1-servicenow-proxy" ^
  --storage-account "actr1proxystorage"
```

## Step 5: Deploy Function

```bash
cd azure-functions
func azure functionapp publish actr1-servicenow-proxy
```

## Step 6: Configure CORS

```bash
az functionapp cors add ^
  --resource-group "actr1-proxy-rg" ^
  --name "actr1-servicenow-proxy" ^
  --allowed-origins "https://alokshrotritr.github.io"
```

## Step 7: Get Function URL

Your function will be available at:
```
https://actr1-servicenow-proxy.azurewebsites.net/api/servicenow-proxy
```

## Step 8: Update React App Configuration

Update `src/services/proxyService.ts`:

```typescript
export const PROXY_URL = 'https://actr1-servicenow-proxy.azurewebsites.net/api/servicenow-proxy';
```

## Step 9: Test the Deployment

Test with curl:
```bash
curl -X POST https://actr1-servicenow-proxy.azurewebsites.net/api/servicenow-proxy ^
  -H "Content-Type: application/json" ^
  -d "{\"endpoint\": \"https://httpbin.org/post\", \"method\": \"POST\", \"body\": \"test=data\"}"
```

## Troubleshooting

### Function Not Found
- Check if deployment was successful
- Verify function name and resource group
- Check Azure portal for any errors

### CORS Issues
- Ensure CORS is configured for your GitHub Pages domain
- Check that the function is returning proper CORS headers

### ServiceNow Connection Issues
- Verify ServiceNow instance URL is accessible from Azure
- Check that OAuth credentials are correct
- Monitor function logs in Azure portal

## Monitoring

View logs in Azure portal:
1. Go to Azure Portal → Function Apps → actr1-servicenow-proxy
2. Navigate to Functions → servicenow-proxy → Monitor
3. View real-time logs and metrics

## Alternative: Quick Deploy with Azure Portal

If CLI deployment has issues:

1. **Create Function App in Portal**:
   - Go to Azure Portal → Create Resource → Function App
   - Name: `actr1-servicenow-proxy`
   - Runtime: Node.js 18
   - Plan: Consumption

2. **Deploy Code**:
   - In portal → Function App → Deployment → Deployment Center
   - Choose GitHub and connect repository
   - Select branch: main
   - Path: /azure-functions

3. **Configure Settings**:
   - Platform → CORS → Add https://alokshrotritr.github.io
   - Configuration → Application Settings (if needed)

Your proxy will be live at:
`https://actr1-servicenow-proxy.azurewebsites.net/api/servicenow-proxy`
