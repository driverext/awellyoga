# Deploying Angular App to cPanel

This guide will walk you through the steps to deploy your Angular application to a cPanel hosting environment.

## Step 1: Build Your Angular Application

1. Run the production build command:
```
ng build --configuration=production
```

2. This will generate optimized files in the `dist/yoga-app/browser` directory.

## Step 2: Prepare Your cPanel Account

1. Log in to your cPanel account.
2. Decide where to deploy your application:
   - In the main domain (public_html)
   - In a subdomain
   - In a subdirectory

2. This will generate optimized files in the `dist/yoga-app/browser` directory.

## Directory Structure for public_html

After building and uploading, your `public_html` directory in Namecheap should look like this:

```
public_html/
│
├── index.html                          # Main entry point
├── .htaccess                           # Apache rewrite rules (create this file)
│
├── assets/                             # Static assets folder
│   ├── albania1.jpg
│   ├── albania2.jpg
│   ├── greece1.png
│   ├── puglia1.jpg
│   └── (all your other images)
│
├── main-[hash].js                      # Main application bundle (e.g., main-VGWG2GPS.js)
├── polyfills-[hash].js                 # Polyfills bundle (e.g., polyfills-FFHMD2TL.js)
├── styles-[hash].css                   # Compiled styles (e.g., styles-C47FWGGA.css)
│
└── chunk-[hash].js                     # Code splitting chunks (multiple files)
    ├── chunk-2IYIP3MZ.js
    ├── chunk-3AOAD44K.js
    ├── chunk-DYPZRHBM.js
    └── (other chunk files)
```

### Important Notes:

1. **Upload ALL contents** from `dist/yoga-app/browser/` directly into `public_html/`
   - ⚠️ **CRITICAL:** Upload from the `browser` subdirectory, NOT from `dist/yoga-app/`
   - Do NOT upload the `browser` folder itself
   - Upload the files INSIDE `dist/yoga-app/browser/` to the root of `public_html/`

2. **Example of what to upload:**
   ```
   Local: dist/yoga-app/browser/index.html          → Upload to: public_html/index.html
   Local: dist/yoga-app/browser/main-VGWG2GPS.js    → Upload to: public_html/main-VGWG2GPS.js
   Local: dist/yoga-app/browser/polyfills-FFHMD2TL.js → Upload to: public_html/polyfills-FFHMD2TL.js
   Local: dist/yoga-app/browser/styles-C47FWGGA.css → Upload to: public_html/styles-C47FWGGA.css
   Local: dist/yoga-app/browser/chunk-*.js          → Upload to: public_html/chunk-*.js
   Local: dist/yoga-app/browser/assets/             → Upload to: public_html/assets/
   ```

3. **The .htaccess file** should be created directly in `public_html/` (not in a subfolder)

4. **File names will have hashes** (e.g., `main-VGWG2GPS.js`) - this is normal and helps with caching. The hash changes with each build.

5. **Angular 19 Structure:** Angular 19 uses the new application builder which creates a `browser` subdirectory. Always upload from `dist/yoga-app/browser/`, not `dist/yoga-app/`.

## Step 3: Upload Files to cPanel

### Option 1: Using File Manager

1. In cPanel, open File Manager.
2. Navigate to your desired directory (e.g., public_html).
3. Click on "Upload" and select all files from your local `dist/yoga-app/browser` directory.
4. Upload all files (including the assets folder and all .js, .css files).

### Option 2: Using FTP

1. Use an FTP client like FileZilla.
2. Connect to your hosting using your FTP credentials.
3. Navigate to your desired directory (e.g., public_html).
4. Upload all files from your local `dist/yoga-app/browser` directory.

### Visual Upload Guide

**Before Upload (Local - Actual Structure):**
```
dist/
└── yoga-app/
    ├── browser/                    ← ⚠️ Upload from HERE
    │   ├── index.html
    │   ├── main-VGWG2GPS.js
    │   ├── polyfills-FFHMD2TL.js
    │   ├── styles-C47FWGGA.css
    │   ├── chunk-2IYIP3MZ.js
    │   ├── chunk-3AOAD44K.js
    │   ├── chunk-DYPZRHBM.js
    │   ├── (other chunk files)
    │   └── assets/
    │       ├── albania1.jpg
    │       ├── greece1.png
    │       └── (all your images)
    ├── prerendered-routes.json     ← Don't upload this
    └── 3rdpartylicenses.txt        ← Optional (don't need to upload)
```

**After Upload (Namecheap public_html):**
```
public_html/
├── index.html                      ← Uploaded from dist/yoga-app/browser/index.html
├── main-VGWG2GPS.js                ← Uploaded from dist/yoga-app/browser/main-VGWG2GPS.js
├── polyfills-FFHMD2TL.js           ← Uploaded from dist/yoga-app/browser/polyfills-FFHMD2TL.js
├── styles-C47FWGGA.css             ← Uploaded from dist/yoga-app/browser/styles-C47FWGGA.css
├── chunk-2IYIP3MZ.js               ← Uploaded from dist/yoga-app/browser/chunk-2IYIP3MZ.js
├── chunk-3AOAD44K.js               ← Uploaded from dist/yoga-app/browser/chunk-3AOAD44K.js
├── (all other chunk files)         ← Upload all chunk files
├── .htaccess                        ← Create this file (see Step 4)
└── assets/                          ← Uploaded from dist/yoga-app/browser/assets/
    ├── albania1.jpg
    ├── greece1.png
    └── (all your images)
```

**⚠️ Common Mistakes:**

1. **Do NOT upload like this:**
   ```
   public_html/
   └── browser/                      ❌ WRONG - Don't create this folder
       └── (files here)
   ```

2. **Do NOT upload like this:**
   ```
   public_html/
   └── yoga-app/                     ❌ WRONG - Don't create this folder
       └── (files here)
   ```

**✅ Correct:** Upload files directly to public_html root:
```
public_html/
├── index.html                       ✅ CORRECT
├── main-VGWG2GPS.js                 ✅ CORRECT
├── assets/                          ✅ CORRECT
└── (all other files)                ✅ CORRECT
```

## Step 4: Configure .htaccess

Create or edit the `.htaccess` file in your upload directory with the following content:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

This configuration ensures that all routes are redirected to index.html, allowing Angular's router to handle them correctly.

## Step 5: Test Your Deployment

1. Open your browser and navigate to your website.
2. Test all features and routes to ensure everything works as expected.
3. Check the browser console for any errors.

## Troubleshooting

### 404 Errors
- Make sure the .htaccess file is properly configured.
- Verify that mod_rewrite is enabled on your server.

### Asset Loading Issues
- Check if paths to assets are relative or absolute.
- Update any hardcoded URLs to match your production environment.

### API Connection Issues
- Update any API endpoint URLs to match your production environment.
- Check CORS settings if your API is on a different domain.

## Notes

- If you're using environment variables, make sure to update them for production.
- Ensure your Angular routing is configured for the correct base path if deploying to a subdirectory. 