# Content Security Policy (CSP) Implementation Guide

## Overview

XIV Dye Tools v2.0.0 implements a **strict Content Security Policy** to protect against XSS (Cross-Site Scripting) attacks and other code injection vulnerabilities.

**Key Security Improvements**:
- ✅ **No `'unsafe-inline'` directives** - All scripts and styles are external
- ✅ **HTTP header-based CSP** - Not meta tag (more secure, full feature support)
- ✅ **Minimal attack surface** - Only allows necessary resources
- ✅ **HTTPS enforcement** - `upgrade-insecure-requests` directive
- ✅ **Frame protection** - `frame-ancestors 'none'` prevents clickjacking

---

## CSP Policy

```
default-src 'self';
script-src 'self';
style-src 'self';
font-src 'self';
img-src 'self' data: blob:;
connect-src 'self' https://universalis.app;
base-uri 'self';
form-action 'none';
frame-ancestors 'none';
upgrade-insecure-requests;
```

### Directive Breakdown

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src 'self'` | Same origin only | Default fallback for all resources |
| `script-src 'self'` | Same origin only | JavaScript files (bundled by Vite) |
| `style-src 'self'` | Same origin only | CSS files (bundled by Vite) |
| `font-src 'self'` | Same origin only | Web fonts (self-hosted) |
| `img-src 'self' data: blob:` | Same origin + data URIs + blobs | Images (user uploads, canvas exports) |
| `connect-src 'self' https://universalis.app` | Same origin + Universalis API | AJAX/Fetch requests |
| `base-uri 'self'` | Same origin only | Prevents `<base>` tag injection |
| `form-action 'none'` | No form submissions | Prevents form hijacking |
| `frame-ancestors 'none'` | Cannot be framed | Prevents clickjacking |
| `upgrade-insecure-requests` | Force HTTPS | Upgrades HTTP to HTTPS automatically |

---

## Deployment Instructions

### Option 1: Netlify

**File**: `netlify.toml` (already created)

1. Deploy to Netlify:
   ```bash
   git push origin main
   ```

2. Netlify automatically reads `netlify.toml` and applies headers.

3. Verify headers in browser DevTools:
   - Open DevTools (F12)
   - Go to **Network** tab
   - Reload page
   - Click on document request
   - Check **Response Headers** for `Content-Security-Policy`

**Test URL**: https://xivdyetools.netlify.app

---

### Option 2: Vercel

**File**: `vercel.json` (already created)

1. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

2. Vercel automatically reads `vercel.json` and applies headers.

3. Verify headers (same as Netlify instructions above).

**Test URL**: https://xivdyetools.vercel.app

---

### Option 3: Apache (Shared Hosting, VPS)

**File**: `public/.htaccess` (already created)

1. Upload `dist/` folder to server (via FTP, SSH, or hosting panel).

2. Ensure `.htaccess` file is in the web root:
   ```bash
   cp public/.htaccess dist/.htaccess
   ```

3. Verify `mod_headers` is enabled:
   ```bash
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

4. Test headers:
   ```bash
   curl -I https://xivdyetools.projectgalatine.com
   ```

**Requirements**:
- Apache 2.4+
- `mod_headers` enabled
- `mod_rewrite` enabled (for HTTPS redirect)
- `mod_deflate` enabled (for GZIP compression)

---

### Option 4: Nginx (VPS, Dedicated Server)

**File**: `nginx.conf.example` (already created)

1. Copy example config:
   ```bash
   sudo cp nginx.conf.example /etc/nginx/sites-available/xivdyetools.conf
   ```

2. Update paths in config:
   - `ssl_certificate` - Your SSL cert path
   - `ssl_certificate_key` - Your SSL key path
   - `root` - Path to `dist/` folder (e.g., `/var/www/xivdyetools/dist`)

3. Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/xivdyetools.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. Test headers:
   ```bash
   curl -I https://xivdyetools.projectgalatine.com
   ```

**Requirements**:
- Nginx 1.18+
- SSL certificate (e.g., Let's Encrypt)
- `http2` module enabled

---

## Testing CSP

### 1. Browser DevTools Security Tab

1. Open browser DevTools (F12)
2. Go to **Security** tab
3. Reload page
4. Check **Content Security Policy** section
5. Should show: **"This page is using a Content Security Policy"**

### 2. Browser DevTools Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for CSP violations (should be **0 violations**)

**Example violation** (should NOT see this):
```
Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self'"
```

If you see violations, there's inline code that needs to be removed.

### 3. Online CSP Validator

Use [CSP Evaluator](https://csp-evaluator.withgoogle.com/) to check policy:

1. Visit https://csp-evaluator.withgoogle.com/
2. Paste CSP policy
3. Review findings (should show **"No vulnerabilities found"**)

### 4. HTTP Header Verification

**Using curl**:
```bash
curl -I https://xivdyetools.projectgalatine.com | grep -i "content-security"
```

**Expected output**:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; ...
```

---

## Troubleshooting

### Issue: CSP Blocks External Resources

**Symptom**: Console shows:
```
Refused to load the script 'https://example.com/script.js' because it violates the following Content Security Policy directive
```

**Solution**: Update CSP to allow the resource:
- For scripts: Add to `script-src`
- For styles: Add to `style-src`
- For images: Add to `img-src`
- For API calls: Add to `connect-src`

**Example** (allowing Google Fonts):
```
style-src 'self' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
```

---

### Issue: CSP Not Applied (Still Using Meta Tag)

**Symptom**: Browser shows old CSP from meta tag.

**Solution**:
1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
2. Verify deployment platform applied headers
3. Check server logs for errors
4. Test with `curl -I` to see raw headers

---

### Issue: Service Worker Blocked

**Symptom**: Console shows:
```
Refused to create a worker from 'blob:...' because it violates the following Content Security Policy directive
```

**Solution**: Add `worker-src 'self' blob:;` to CSP:
```
worker-src 'self' blob:;
```

---

### Issue: Canvas/Blob Images Blocked

**Symptom**: Color Matcher tool fails to load images.

**Solution**: Ensure `img-src` includes `data:` and `blob:`:
```
img-src 'self' data: blob:;
```

---

## Additional Security Headers

In addition to CSP, XIV Dye Tools implements these security headers:

### X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**Purpose**: Prevents MIME type sniffing. Browsers will honor `Content-Type` headers exactly.

---

### X-Frame-Options

```
X-Frame-Options: DENY
```

**Purpose**: Prevents clickjacking by disallowing the page to be embedded in `<iframe>`, `<frame>`, or `<object>`.

---

### X-XSS-Protection

```
X-XSS-Protection: 1; mode=block
```

**Purpose**: Enables browser's XSS filter (legacy header, CSP is primary protection).

---

### Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose**: Controls how much referrer information is sent with requests.

**Behavior**:
- Same-origin: Full URL sent
- Cross-origin (HTTPS → HTTPS): Origin only
- Cross-origin (HTTPS → HTTP): No referrer

---

### Permissions-Policy

```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Purpose**: Disables unnecessary browser features to reduce attack surface.

**Features disabled**:
- Geolocation API
- Microphone access
- Camera access

---

## Monitoring CSP Violations

For production, consider implementing CSP violation reporting:

### Step 1: Add `report-uri` directive

```
Content-Security-Policy: ...; report-uri https://your-csp-report-endpoint.com/report;
```

### Step 2: Set up reporting endpoint

Use a service like:
- [Report URI](https://report-uri.com/)
- [Sentry](https://sentry.io/)
- Custom endpoint (receives POST requests with violation JSON)

### Step 3: Review reports

Regularly check reports for:
- Unexpected violations (possible attacks)
- Legitimate violations (CSP policy needs updating)

---

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Can I Use: CSP Support](https://caniuse.com/contentsecuritypolicy2)

---

## Changelog

### v2.0.0 (November 17, 2025)
- ✅ Removed all `'unsafe-inline'` directives
- ✅ Moved CSP from meta tag to HTTP headers
- ✅ Created deployment configs for Netlify, Vercel, Apache, Nginx
- ✅ Added comprehensive security headers
- ✅ Implemented strict CSP with minimal attack surface

### v1.6.x (Legacy)
- ⚠️ Used CSP meta tag with `'unsafe-inline'`
- ⚠️ Inline scripts and styles present

---

**Last Updated**: December 26, 2025
**Maintained By**: Development Team
**Next Review**: After first production deployment with new CSP
