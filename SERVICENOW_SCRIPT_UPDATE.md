# ServiceNow Script Update Instructions

## 🔧 Update Your Custom REST API Script

1. **Log into ServiceNow**:
   - Go to https://dev279775.service-now.com
   - Login as admin

2. **Navigate to REST API**:
   - Go to System Web Services > Scripted Web Services > Scripted REST APIs
   - Find your "ACTR1 Incident API" 
   - Click on the API name

3. **Edit the GET Resource**:
   - Click on the "GET" resource under Resources
   - This should show your script for `/incident/{number}`

4. **Replace the Script**:
   - Copy the entire content from `servicenow-basic-auth-script.js`
   - Replace ALL the existing script content
   - Click "Update" to save

## 🔍 Key Changes in New Script

The new script:
- ✅ Handles Basic Authentication (Authorization header)
- ✅ Validates admin user credentials
- ✅ Provides detailed error messages
- ✅ Logs authentication steps for debugging
- ✅ Returns proper CORS headers for GitHub Pages

## 🧪 Test After Update

After updating the script in ServiceNow:
1. Open `api-debug-test.html` in browser
2. Click "Test Custom API" button
3. Check browser console for detailed logs
4. Should see "✅ CUSTOM API SUCCESS!" if working

## 🚨 If Still Having Issues

Check ServiceNow System Logs:
1. Go to System Logs > System Log > All
2. Filter by "ACTR1 API" in the message
3. Look for authentication and error messages

The new script includes extensive logging to help identify exactly where authentication is failing.
