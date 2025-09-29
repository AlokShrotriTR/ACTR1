# AWS Lambda Deployment Guide for ACTR1 ServiceNow Proxy

## 🎯 Overview
This guide will help you deploy the ServiceNow OAuth proxy to AWS Lambda to bypass CORS issues.

## 📋 Prerequisites
- AWS Account with Lambda and API Gateway permissions
- The `actr1-proxy-lambda.zip` file (already created in aws-lambda folder)

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Lambda Function

1. **Go to AWS Lambda Console**
   - Open [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
   - Click **"Create function"**

2. **Configure Function**
   - Choose **"Author from scratch"**
   - Function name: `actr1-servicenow-proxy`
   - Runtime: **Node.js 18.x** (or latest available)
   - Architecture: **x86_64**
   - Click **"Create function"**

### Step 2: Upload Function Code

1. **Upload ZIP File**
   - In the Lambda function page, go to **"Code"** tab
   - Click **"Upload from"** → **".zip file"**
   - Select the `actr1-proxy-lambda.zip` file from your aws-lambda folder
   - Click **"Save"**

2. **Verify Upload**
   - You should see `index.js` and `package.json` in the code editor
   - The handler should be set to `index.handler`

### Step 3: Configure Function Settings

1. **Timeout Settings**
   - Go to **"Configuration"** tab → **"General configuration"**
   - Click **"Edit"**
   - Set **Timeout**: `30 seconds`
   - Memory: `128 MB` (sufficient for proxy)
   - Click **"Save"**

2. **Environment Variables (Optional)**
   - Go to **"Configuration"** tab → **"Environment variables"**
   - Add if needed:
     - `NODE_ENV`: `production`
     - `SERVICENOW_INSTANCE`: `dev279775.service-now.com`

### Step 4: Create API Gateway Trigger

1. **Add Trigger**
   - In Lambda function page, click **"Add trigger"**
   - Select **"API Gateway"**

2. **Configure API Gateway**
   - API type: **HTTP API** (recommended) or **REST API**
   - Security: **Open** (CORS will handle security)
   - Click **"Add"**

3. **Note the API Endpoint**
   - Copy the API endpoint URL (something like):
   ```
   https://abc123def4.execute-api.us-east-1.amazonaws.com/default/actr1-servicenow-proxy
   ```

### Step 5: Configure CORS

1. **For HTTP API** (Recommended)
   - Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
   - Find your API → **CORS**
   - Configure CORS:
     - **Access-Control-Allow-Origin**: `https://alokshrotritr.github.io`
     - **Access-Control-Allow-Headers**: `Content-Type, Authorization, Accept`
     - **Access-Control-Allow-Methods**: `GET, POST, OPTIONS`

2. **For REST API** (Alternative)
   - In API Gateway console → Your API → Resources
   - Select the resource → Actions → **Enable CORS**
   - Configure the same settings as above
   - **Deploy API** after configuration

---

## 🧪 Step 6: Test Your Lambda Function

### Test in AWS Console
1. **Create Test Event**
   - In Lambda function → **Test** tab
   - Create new test event:
   ```json
   {
     "httpMethod": "POST",
     "body": "{\"endpoint\":\"https://httpbin.org/post\",\"method\":\"POST\",\"headers\":{\"Content-Type\":\"application/json\"},\"body\":\"{\\\"test\\\":\\\"data\\\"}\"}"
   }
   ```
   - Click **"Test"**
   - Should return status 200 with response data

### Test with CURL
```bash
curl -X POST "https://YOUR_API_ENDPOINT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "https://httpbin.org/post",
    "method": "POST",
    "headers": {"Content-Type": "application/json"},
    "body": "{\"test\": \"data\"}"
  }'
```

---

## 🔧 Step 7: Update Your React App

Update `src/services/proxyService.ts`:

```typescript
// Replace with your actual API Gateway endpoint
export const PROXY_URL = 'https://YOUR_API_GATEWAY_URL';
```

**Example:**
```typescript
export const PROXY_URL = 'https://abc123def4.execute-api.us-east-1.amazonaws.com/default/actr1-servicenow-proxy';
```

---

## 📊 Step 8: Deploy and Test End-to-End

1. **Update and Deploy React App**
   ```bash
   npm run build
   git add .
   git commit -m "Update proxy URL for AWS Lambda"
   git push
   ```

2. **Test OAuth Flow**
   - Wait for GitHub Pages deployment (2-3 minutes)
   - Open your Teams app
   - Click **"Login to ServiceNow"**
   - OAuth should work without CORS errors!

---

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors Still Happening**
   - Verify CORS is properly configured in API Gateway
   - Check that the Origin header matches exactly: `https://alokshrotritr.github.io`
   - Ensure you deployed the API after CORS changes

2. **Lambda Timeout**
   - Increase timeout to 30 seconds in Lambda configuration
   - Check CloudWatch logs for detailed error messages

3. **500 Internal Server Error**
   - Check CloudWatch logs: AWS Console → Lambda → Your function → Monitor → View logs in CloudWatch
   - Common issues: Missing permissions, malformed requests

4. **API Gateway 403 Forbidden**
   - Verify the Lambda function has proper execution role
   - Check that API Gateway has permission to invoke Lambda

### Debug Steps
1. **Check CloudWatch Logs**
   - Go to CloudWatch → Log groups → `/aws/lambda/actr1-servicenow-proxy`
   - View recent logs for error details

2. **Test Lambda Directly**
   - Use the Test feature in Lambda console with sample events

3. **Verify API Gateway Integration**
   - Test the API Gateway endpoint directly with Postman or curl

---

## 💰 Cost Estimation

### AWS Lambda
- **Free Tier**: 1M requests + 400,000 GB-seconds per month
- **Typical Usage**: ~1,000 OAuth requests/month
- **Estimated Cost**: $0.00 (well within free tier)

### API Gateway
- **Free Tier**: 1M API calls per month (first 12 months)
- **After Free Tier**: $1.00 per million API calls
- **Estimated Cost**: $0.00 - $0.001/month

**Total Monthly Cost**: ~$0.00 for typical usage

---

## 🔒 Security Best Practices

1. **CORS Configuration**
   - Only allow your GitHub Pages domain
   - Don't use wildcard (*) for production

2. **Monitor Usage**
   - Set up CloudWatch alarms for unusual activity
   - Monitor costs in AWS Billing dashboard

3. **Keep Logs**
   - CloudWatch logs help with debugging and security monitoring

---

## ✅ Success Checklist

- [ ] Lambda function created and code uploaded
- [ ] Function timeout set to 30 seconds
- [ ] API Gateway trigger added
- [ ] CORS properly configured
- [ ] Test event passes in Lambda console
- [ ] API endpoint accessible via curl
- [ ] React app updated with new proxy URL
- [ ] GitHub Pages deployed with changes
- [ ] OAuth flow works in Teams app

---

## 📞 Need Help?

If you encounter issues:
1. Check CloudWatch logs first
2. Verify all configuration settings
3. Test each component individually
4. Use the AWS Support Center if needed

Your AWS Lambda proxy should now handle all ServiceNow OAuth requests without CORS issues! 🎉
