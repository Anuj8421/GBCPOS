# 🔧 Complete NGINX + CORS Fix Guide

## 🔍 Problem Diagnosis

### Symptoms:
- ✅ **Postman works** - API returns correct data
- ❌ **UI doesn't show data** - Browser console shows CORS errors
- ❌ **OPTIONS returns 502** - Preflight requests fail
- ❌ **GET/POST blocked** - Even though API returns data

### Why This Happens:

#### **Browser Flow (CORS Preflight):**
```
1. User clicks button in UI
2. Browser sends OPTIONS request (preflight)
   ↓
3. Nginx receives OPTIONS
   ↓
4. Nginx returns 502 Bad Gateway ❌
   ↓
5. Browser sees failed preflight
   ↓
6. Browser BLOCKS the actual GET/POST request
   ↓
7. UI shows no data (even though API works fine)
```

#### **Postman Flow (No Preflight):**
```
1. Send request in Postman
2. Postman sends GET/POST directly (no OPTIONS)
   ↓
3. Nginx forwards to Node.js
   ↓
4. Node.js returns data ✅
   ↓
5. Postman shows data ✅
```

### Key Insight:
**Browsers send OPTIONS before actual requests. Postman doesn't.**

---

## ✅ Complete Solution

### **Option 1: Handle OPTIONS in Nginx (Recommended)**

**Why?** Faster - Nginx responds to OPTIONS without hitting Node.js.

#### Step 1: Update Nginx Config

**File: `/etc/nginx/sites-available/gbc-api`**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Change this
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;  # Change this

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Logs
    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log;

    # Large request support
    client_max_body_size 50M;
    client_body_buffer_size 16k;

    location / {
        # ============================================
        # CRITICAL: Handle OPTIONS (CORS Preflight)
        # ============================================
        if ($request_method = 'OPTIONS') {
            # Allow all origins (or specify your frontend domain)
            add_header 'Access-Control-Allow-Origin' '$http_origin' always;
            
            # Allowed methods
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
            
            # Allowed headers
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With, X-Custom-Header' always;
            
            # Allow credentials (cookies, auth)
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            
            # Cache preflight response for 1 hour
            add_header 'Access-Control-Max-Age' '3600' always;
            
            # Return 204 (No Content) for OPTIONS
            add_header 'Content-Length' '0' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8' always;
            return 204;
        }

        # ============================================
        # CORS headers for actual requests
        # ============================================
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # ============================================
        # Proxy to Node.js Backend
        # ============================================
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        
        # Essential headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }

    # Health check endpoint (optional)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

#### Step 2: Test & Reload Nginx

```bash
# Test config
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Watch logs
sudo tail -f /var/log/nginx/api_error.log
```

---

### **Option 2: Let Node.js Handle CORS**

**Why?** More control in application code.

#### Step 1: Simpler Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 2: Enhanced Node.js CORS (Already Applied)

Your `/app/backend/src/server.ts` now has:
- ✅ Proper CORS origin validation
- ✅ Explicit OPTIONS handling
- ✅ Credential support
- ✅ All necessary headers
- ✅ Preflight caching

---

## 🧪 Testing

### Test 1: OPTIONS Request (Preflight)

```bash
curl -I -X OPTIONS https://api.yourdomain.com/api/orders/list \
  -H "Origin: https://your-frontend-domain.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type"
```

**Expected Response:**
```
HTTP/2 204
access-control-allow-origin: https://your-frontend-domain.com
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
access-control-allow-headers: Authorization, Content-Type, Accept, Origin, X-Requested-With
access-control-allow-credentials: true
access-control-max-age: 3600
```

### Test 2: Actual API Request

```bash
curl -X GET https://api.yourdomain.com/api/orders/list \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Origin: https://your-frontend-domain.com"
```

**Expected:**
- Status: 200
- CORS headers present
- Data returned

### Test 3: Browser Console

1. Open your frontend in browser
2. Open DevTools → Network tab
3. Trigger an API call
4. Check:
   - ✅ OPTIONS request returns 204
   - ✅ GET/POST request returns 200
   - ✅ No CORS errors in console

---

## 🔧 Troubleshooting

### Issue 1: Still Getting 502 on OPTIONS

**Check:**
```bash
# Is Node.js running?
sudo systemctl status node-app  # or your service name

# Check if port 8001 is listening
sudo netstat -tlnp | grep 8001

# Test Node.js directly (bypass Nginx)
curl -I -X OPTIONS http://localhost:8001/api/health
```

**Fix:**
- Restart Node.js: `sudo systemctl restart node-app`
- Check Node.js logs: `journalctl -u node-app -f`

---

### Issue 2: CORS Headers Not Appearing

**Nginx:**
```bash
# Check if config has CORS headers
sudo nginx -T | grep "Access-Control"

# Restart Nginx (not just reload)
sudo systemctl restart nginx
```

**Node.js:**
```javascript
// Verify CORS is enabled
console.log('CORS enabled for:', process.env.CORS_ORIGINS);
```

---

### Issue 3: Multiple CORS Headers

**Symptom:** Browser console shows duplicate CORS headers

**Cause:** Both Nginx AND Node.js adding headers

**Fix:** Choose ONE approach:
- **Either** Nginx handles OPTIONS (Option 1)
- **Or** Node.js handles OPTIONS (Option 2)
- **Don't mix both!**

If using Nginx for OPTIONS, remove CORS from Node.js:
```javascript
// Remove or comment out
// app.use(cors(...));
```

---

### Issue 4: Specific Origin Not Allowed

**Error:** `Origin 'https://your-app.com' is not allowed by CORS`

**Fix in Nginx:**
```nginx
# Replace $http_origin with specific domain
add_header 'Access-Control-Allow-Origin' 'https://your-app.com' always;
```

**Fix in Node.js .env:**
```env
CORS_ORIGINS=https://your-app.com,https://app.yourdomain.com
```

---

## 📋 Checklist

### Before Deploying:

- [ ] Nginx config has OPTIONS handling
- [ ] SSL certificate installed and valid
- [ ] Node.js backend is running on correct port
- [ ] CORS_ORIGINS environment variable set
- [ ] Firewall allows ports 80, 443
- [ ] DNS points to your server IP

### After Deploying:

- [ ] Test OPTIONS with curl
- [ ] Test actual API requests with curl
- [ ] Open frontend in browser
- [ ] Check Network tab (no CORS errors)
- [ ] Verify data loads in UI
- [ ] Test on mobile browser

---

## 🎯 Quick Reference

### Common CORS Headers:

| Header | Purpose |
|--------|---------|
| `Access-Control-Allow-Origin` | Which domains can access |
| `Access-Control-Allow-Methods` | Which HTTP methods allowed |
| `Access-Control-Allow-Headers` | Which headers allowed |
| `Access-Control-Allow-Credentials` | Allow cookies/auth |
| `Access-Control-Max-Age` | Cache preflight response |

### HTTP Status Codes:

| Code | Meaning |
|------|---------|
| 204 | OPTIONS success (no content) |
| 200 | GET/POST success |
| 502 | Bad Gateway (Nginx can't reach backend) |
| 403 | Forbidden (CORS blocked) |

---

## 🆘 Still Not Working?

### Debug Logs:

```bash
# Nginx error log
sudo tail -f /var/log/nginx/api_error.log

# Node.js logs
journalctl -u your-node-service -f

# Test connectivity
curl http://localhost:8001/api/health
```

### Get Help:

1. Check Nginx logs for errors
2. Check Node.js logs for crashes
3. Verify port 8001 is listening
4. Test with `curl` before testing in browser
5. Share error logs for further diagnosis

---

## 📖 Why UI Can't Show Data Even Though API Returns It

### The Security Model:

1. **Browser Same-Origin Policy:**
   - Browsers block cross-origin requests by default
   - Even if API returns data, browser throws it away
   - This is a security feature to prevent malicious sites

2. **CORS Preflight Check:**
   - Before actual request, browser asks: "Is this OK?"
   - Sends OPTIONS request to check permissions
   - If OPTIONS fails → Browser blocks everything
   - If OPTIONS succeeds → Browser allows actual request

3. **Why Postman Works:**
   - Postman is not a browser
   - No same-origin policy
   - No preflight checks
   - Sends requests directly

### The Fix:
Tell the browser "It's OK to allow this request" by:
1. Responding to OPTIONS with proper headers
2. Adding CORS headers to actual responses
3. Ensuring Nginx doesn't interfere

---

**Updated by E1 Agent - Backend Migration Complete**
