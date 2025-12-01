# 🔧 Complete Deployment Fix Guide

## Issue 1: API URLs Configuration ✅ FIXED

### Problem
- Login API worked: `http://13.200.235.81:8001/api/auth/login`
- Other APIs failed because they went to S3 URL instead of backend

### Root Cause
The axios client was using `baseURL` set at build time from `.env`, but you were changing the URL dynamically in Settings using localStorage. The baseURL wasn't updating on subsequent API calls.

### Solution Applied
Updated `/app/frontend/src/services/api.js` to:
1. **Dynamically fetch backend URL** from localStorage on every request
2. **Set baseURL in request interceptor** (not at axios instance creation)
3. Support both environment variable and localStorage override

### How It Works Now
```javascript
// Gets URL from localStorage (if set in Settings) or falls back to .env
const getBackendUrl = () => {
  return localStorage.getItem('custom_backend_url') || process.env.REACT_APP_BACKEND_URL || '';
};

// On EVERY request, set the current baseURL
apiClient.interceptors.request.use((config) => {
  config.baseURL = `${getBackendUrl()}/api`;
  // ... rest of code
});
```

### Testing the Fix
1. Go to Settings page
2. Enter your backend URL: `http://13.200.235.81:8001`
3. Click Save
4. Click "Reload App"
5. Click "Run API Tests"
6. All APIs should now use the correct backend URL

---

## Issue 2: S3 Static Website Not Opening on Mobile

### Problem Summary
- **Desktop**: Works fine on `http://eventmanagmeent.s3-website.ap-south-1.amazonaws.com`
- **Mobile**: Cannot connect, blank screen, or "site not reachable"
- **HTTPS object URL** (`https://eventmanagmeent.s3.ap-south-1.amazonaws.com/index.html`) works
- **Deep links** (`/orders`, `/dashboard`) don't work

### Root Causes

#### 1. **HTTP vs HTTPS Issue**
- Modern mobile browsers (especially iOS Safari, Chrome on Android) **block or warn against HTTP sites**
- Your S3 static website endpoint uses **HTTP only** (AWS doesn't provide HTTPS for S3 static hosting)
- Mobile networks and carriers often block HTTP traffic

#### 2. **React Router Deep Link Issue**
- S3 static hosting doesn't understand React Router paths
- When you visit `/orders` directly, S3 looks for a file called `orders` (doesn't exist)
- Returns 404 instead of serving `index.html`

#### 3. **Mixed Content**
- Your backend API is `http://13.200.235.81:8001` (HTTP)
- If your frontend uses HTTPS, browsers block HTTP API calls (mixed content)

### Complete Solution: Use CloudFront + HTTPS

---

## 🎯 Step-by-Step Fix for Mobile Access

### Option 1: Quick Fix (HTTP Backend + CloudFront)

**If you want to keep HTTP backend** (not recommended for production):

#### Step 1: Create CloudFront Distribution

1. **Go to AWS CloudFront Console**
   - https://console.aws.amazon.com/cloudfront

2. **Create Distribution**
   - Click "Create Distribution"

3. **Origin Settings**:
   ```
   Origin Domain: eventmanagmeent.s3-website.ap-south-1.amazonaws.com
   Protocol: HTTP Only
   Name: S3-GBC-POS
   ```

4. **Default Cache Behavior**:
   ```
   Viewer Protocol Policy: Redirect HTTP to HTTPS
   Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   Cache Policy: CachingDisabled (for now)
   ```

5. **Settings**:
   ```
   Price Class: Use All Edge Locations (or choose your region)
   Alternate Domain Names: (leave empty for now)
   Custom SSL Certificate: Default CloudFront Certificate
   Default Root Object: index.html
   ```

6. **Error Pages** (CRITICAL for React Router):
   - After creating distribution, go to "Error Pages" tab
   - Create custom error response:
     ```
     HTTP Error Code: 403
     Response Page Path: /index.html
     HTTP Response Code: 200
     
     HTTP Error Code: 404
     Response Page Path: /index.html
     HTTP Response Code: 200
     ```

7. **Deploy**
   - Click "Create Distribution"
   - Wait 10-15 minutes for deployment
   - You'll get a CloudFront URL like: `https://d1234abcd.cloudfront.net`

#### Step 2: Update CORS on Backend

Your Node.js backend needs to allow CloudFront domain:

```javascript
// In /app/backend/src/server.ts or .env
CORS_ORIGINS=https://d1234abcd.cloudfront.net,http://eventmanagmeent.s3-website.ap-south-1.amazonaws.com
```

#### Step 3: Update Frontend Environment

In your **Settings page**:
- Backend URL: `http://13.200.235.81:8001`
- This will work because CloudFront serves over HTTPS but makes HTTP calls to your backend

#### Step 4: Test on Mobile
- Open CloudFront URL on mobile: `https://d1234abcd.cloudfront.net`
- Should work perfectly!

---

### Option 2: Proper Production Setup (HTTPS Everything)

**Recommended for production**:

#### A. Set up HTTPS for Backend

You have two options:

**Option 2A: Use Nginx Reverse Proxy with Let's Encrypt**

1. **Install Nginx on EC2** (where your Node.js backend runs):
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx
   ```

2. **Get a domain** (e.g., `api.yourdomain.com` from Namecheap, GoDaddy, etc.)

3. **Point domain to your EC2 IP**:
   - A Record: `api.yourdomain.com` → `13.200.235.81`

4. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/gbc-api
   ```
   
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:8001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

5. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/gbc-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

7. **Your backend is now**: `https://api.yourdomain.com`

**Option 2B: Use AWS Application Load Balancer + ACM Certificate**

1. Get a domain
2. Create ALB with HTTPS listener
3. Request ACM certificate
4. Point ALB to EC2 instance
5. Update security groups

#### B. Set up Frontend with Custom Domain

1. **Get domain**: `app.yourdomain.com`

2. **Request ACM Certificate** (in us-east-1 region for CloudFront):
   - Go to AWS Certificate Manager
   - Request certificate for `app.yourdomain.com`
   - Validate via DNS (add CNAME records)

3. **Update CloudFront Distribution**:
   ```
   Alternate Domain Names: app.yourdomain.com
   Custom SSL Certificate: Select your ACM certificate
   ```

4. **Add Route 53 or DNS Record**:
   - CNAME: `app.yourdomain.com` → CloudFront domain

5. **Update Frontend Settings**:
   - Backend URL: `https://api.yourdomain.com`

---

## 🚀 Recommended Immediate Steps

### For Testing Now (Quickest):

1. **Create CloudFront distribution** (Option 1 above)
2. **Use CloudFront HTTPS URL** on mobile
3. **Backend stays HTTP** for now (but plan to upgrade)

### For Production (Best):

1. **Get two subdomains**:
   - `api.yourdomain.com` (backend)
   - `app.yourdomain.com` (frontend)

2. **Set up HTTPS for backend** (Nginx + Let's Encrypt or ALB)

3. **Set up CloudFront + ACM** for frontend

4. **Update CORS** on backend to allow frontend domain

---

## 📋 Checklist

### Frontend Fixes ✅
- [x] Update `api.js` to use dynamic backend URL
- [x] Settings page allows URL configuration
- [x] All API calls use correct baseURL

### Mobile Access Fixes 🔄 (To Do)
- [ ] Create CloudFront distribution
- [ ] Configure error pages for React Router
- [ ] Test on mobile devices
- [ ] (Optional) Set up custom domain + HTTPS

### Backend HTTPS Setup 🔄 (Recommended for Production)
- [ ] Get domain for API
- [ ] Set up Nginx reverse proxy OR AWS ALB
- [ ] Install SSL certificate (Let's Encrypt or ACM)
- [ ] Update frontend backend URL to HTTPS

---

## 🧪 Testing Guide

### Test API Client Fix:

1. Open browser DevTools → Network tab
2. Login to app
3. Navigate to Orders page
4. Check Network tab - all requests should go to: `http://13.200.235.81:8001/api/...`

### Test Mobile Access (After CloudFront):

1. Open CloudFront URL on mobile browser
2. Try logging in
3. Navigate to different pages (`/orders`, `/dashboard`, `/menu`)
4. All should work without errors

---

## ❗ Important Notes

1. **Mixed Content Warning**: 
   - If frontend is HTTPS but backend is HTTP, browsers may block API calls
   - Solution: Make backend HTTPS too

2. **CORS Configuration**:
   - Backend must allow your frontend domain in CORS
   - Update `CORS_ORIGINS` in backend `.env`

3. **S3 Bucket Policy**:
   - Make sure S3 bucket has public read access for CloudFront

4. **Cache Invalidation**:
   - After uploading new frontend build, invalidate CloudFront cache:
     ```bash
     aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
     ```

---

## 🆘 Troubleshooting

### Issue: APIs still go to wrong URL after fix
**Solution**: 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Clear localStorage: `localStorage.clear()` in console
- Ensure you clicked "Reload App" after saving URL

### Issue: Mobile still doesn't connect
**Solution**:
- Verify CloudFront distribution is deployed (status: "Deployed")
- Check error pages are configured (403/404 → index.html)
- Test CloudFront URL on desktop first
- Check mobile browser console for errors

### Issue: "Mixed Content" errors
**Solution**:
- Your frontend is HTTPS but backend is HTTP
- Either:
  - Make backend HTTPS (recommended)
  - Use CloudFront with HTTP backend (temporary)

---

## 📞 Need Help?

If issues persist:
1. Share browser console errors
2. Share Network tab screenshots
3. Confirm CloudFront distribution URL
4. Test on different mobile browsers (Safari, Chrome, Firefox)

---

**Updated by E1 Agent - Backend Migration Complete**
