# Liferay Deployment Guide

## Overview

This comprehensive guide provides step-by-step instructions for deploying Liferay implementations, including client extensions and fragment collections. It covers deployment procedures, verification steps, troubleshooting, and best practices based on proven deployment experience.

## Deployment Files Structure

### 📦 Fragment Collection ZIP
- **File**: e.g. `johnson-matthey-collection.zip` (48.6 KB)
- **Contents**: Complete fragment collection with all 6 fragments
- **Structure**: Proper Liferay collection format with root directory

### 📁 Individual Fragment ZIPs
Located in `fragment-zips/` directory:
- `jm-header.zip` (7.2 KB) - Header with navigation and modals
- `jm-hero.zip` (6.6 KB) - Hero section with video functionality
- `jm-news-carousel.zip` (7.6 KB) - News carousel component
- `jm-share-price.zip` (7.3 KB) - Share price widget with charts
- `jm-company-overview.zip` (8.4 KB) - Company statistics section
- `jm-footer.zip` (9.4 KB) - Footer with social links and newsletter

### 🎨 Client Extension
Located in `jm-frontend-client-extension/` directory:
- Global CSS and JavaScript for site-wide functionality
- Site branding using Liferay Classic theme tokens

## Deployment Steps

### IMPORTANT: Separate Deployments

It is critical to understand that **Client Extensions** and **Fragment Collections** are deployed separately and using different methods.

*   **Fragment Collections** are packaged as `.zip` files and imported through the "Page Fragments" interface in the Site Builder. The Python script (`create_fragment_collection_zip.py`) is specifically designed to package the `everflow-collection` directory for this purpose. It **does not** and **should not** include the client extension.
*   **Client Extensions** are deployed as a whole directory, typically through Liferay's developer tooling (like the `lfr` CLI) or by manually placing the directory in the `deploy` folder of your Liferay instance. They are **not** zipped.

Never attempt to zip the client extension and the fragment collection together into a single package.

### Step 1: Deploy Client Extensions

1. Navigate to Liferay's **Client Extensions** area in the admin interface
2. Upload or deploy the `jm-frontend-client-extension/` folder
3. Ensure both CSS and JavaScript client extensions are activated
4. Client extensions will use Liferay's default scoping behavior (no explicit scope configuration required)

### Step 2: Deploy Fragment Collection (Option A - Complete Collection)

1. Go to **Site Builder** > **Page Fragments**
2. Click **Import** or **Add Collection**
3. Upload `johnson-matthey-collection.zip`
4. Verify all 6 fragments are imported successfully
5. Check that collection appears in fragment library

### Step 2: Deploy Individual Fragments (Option B - Selective Import)

1. Go to **Site Builder** > **Page Fragments**
2. Create a new collection or select existing collection
3. Import individual ZIP files from `fragment-zips/` as needed
4. Import only the fragments required for your site

### Step 3: Verify Deployment

1. **Check Fragment Library**: All fragments should appear with thumbnails
2. **Test Fragment Configuration**: Each fragment should have editable configuration options
3. **Verify Client Extension Loading**: Global CSS and JS should be active site-wide

## Fragment Usage Guidelines

### Building Pages with Fragments

1. **Create New Page** or edit existing page in Liferay
2. **Add Fragments** from the Johnson Matthey collection
3. **Configure Each Fragment** using the configuration panels
4. **Edit Content** using Liferay's inline editing system

### Recommended Page Structure

```
├── JM Header (navigation and branding)
├── JM Hero (homepage hero section)
├── JM Company Overview (statistics and focus areas)
├── JM News Carousel (latest news and updates)
├── JM Share Price (financial information)
└── JM Footer (contact and social links)
```

## Fragment Example Configuration Options

### JM Header
- Navigation style and layout options
- Mobile menu configuration
- Login/search modal settings
- Dropzone locations for additional content

### JM Hero
- Video URL configuration
- Call-to-action button settings
- Background and layout options
- Hero text and imagery

### JM News Carousel
- Number of news items to display
- Auto-play and transition settings
- Touch/swipe navigation options
- Accessibility features

### JM Share Price
- Stock symbol configuration
- Chart display options
- Update frequency settings
- Market data sources

### JM Company Overview
- Statistics display options
- Animation settings
- Focus area configuration
- Layout variations

### JM Footer
- Social media links
- Newsletter signup configuration
- Back-to-top button settings
- Legal links and contact information

## Technical Requirements

### Liferay Version Compatibility
- **Minimum**: Liferay DXP 7.4+ or Liferay Portal CE 7.4+
- **Recommended**: Latest stable version
- **Theme**: Liferay Classic theme (for frontend token support)

### Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Mobile browsers with touch event support
- Accessibility-compliant screen readers

### Performance Considerations
- Fragments optimized for Google Lighthouse scores
- Minimal JavaScript footprint with lazy loading
- CSS scoped to prevent admin interface conflicts
- SVG graphics for scalable, lightweight icons

## Development Environment

### Scripting and Tooling
- **Python**: The development environment has Python installed and is available for scripting tasks.
- **Fragment Packaging**: It is **required** to use the provided Python scripts (e.g., `create_zip.py`) to package fragment collections. Standard shell tools like `Compress-Archive` or `tar` have been shown to create archives that are incompatible with the Liferay importer.

## Content Management

### Editable Content

All fragments include editable content areas for:
- **Text Content**: Headlines, descriptions, button labels
- **Images**: Company logos, hero images, news thumbnails
- **Links**: Navigation items, call-to-action buttons, social media
- **Configuration**: Display options, layout settings, feature toggles

### Content Editor Guidelines

1. **Use Liferay's Inline Editing**: Click on editable areas to modify content
2. **Configure Fragment Settings**: Use fragment configuration panels for layout options
3. **Image Management**: Upload images through Liferay's document library
4. **Link Management**: Use Liferay's link picker for internal and external links

## Troubleshooting

### Common Issues

**Fragments Not Appearing in Library**
- Verify ZIP file structure matches Liferay requirements
- Check that all required files are present (fragment.json, thumbnail.png)
- Ensure proper file naming convention (index.html, index.css, index.js)

**Styling Issues**
- Confirm client extensions are deployed and active
- Check that CSS is scoped to `#wrapper` to prevent conflicts
- Verify Liferay Classic theme is active

**JavaScript Functionality Not Working**
- Ensure global JavaScript client extension is loaded
- Check browser console for JavaScript errors
- Verify fragment JavaScript is scoped to fragment elements only

**Configuration Options Not Available**
- Check configuration.json files for proper syntax
- Verify fragment.json includes configurationPath reference
- Ensure fragment is properly imported with all files

## Fragment ZIP Structure Best Practices

### Individual Fragment ZIP Structure:
```
fragment-name/
├── fragment.json          # Main fragment metadata
├── configuration.json     # Fragment configuration schema  
├── index.html            # FreeMarker template
├── index.css             # Fragment styles
├── index.js              # Fragment JavaScript
└── thumbnail.png         # Fragment thumbnail (REQUIRED)
```

### Fragment Collection ZIP Structure:
```
collection-name/           # Root directory REQUIRED for proper import
├── collection.json       # Collection metadata (name, description)
├── fragments/
│   ├── fragment-name-1/
│   │   ├── fragment.json
│   │   ├── configuration.json
│   │   ├── index.html
│   │   ├── index.css
│   │   ├── index.js
│   │   └── thumbnail.png
│   └── ...
└── resources/            # Optional shared resources
    ├── icon-1.svg
    ├── logo.png
    └── ...
```

### Critical ZIP Creation (Python Implementation):

```python
import zipfile
import os

with zipfile.ZipFile('collection.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipf.write('collection.json', 'collection-name/collection.json')
    zipf.write('resources', 'collection-name/resources/')
    # Add all files with collection-name/ prefix
```

### Key ZIP Requirements:

- Fragment ZIP: Must contain fragment folder with all files inside
- Collection ZIP: Must have proper root directory structure (collection-name/) containing collection.json + fragments/ + resources/
- Fragment.json: Must include all path references AND thumbnailPath (thumbnails are REQUIRED)
- Collection.json: Simple object with name and description only
- Thumbnail files: Every fragment must have thumbnail.png file (70+ bytes) and thumbnailPath reference
- Select field typeOptions: Must be object with validValues array, not direct array
- Resources: Place in resources/ directory and reference with `[resources:filename]` syntax
- ZIP Creation: Use Python zipfile module with proper root directory structure to ensure resources upload correctly

## Client Extension YAML Configuration

The structure of the `client-extension.yaml` is critical for a successful deployment. Using an outdated or incorrect format will cause the deployment to fail.

### ✅ Correct YAML Structure

Each client extension (e.g., for global CSS or global JS) must be defined as its own top-level key. Each individual CSS or JavaScript file intended for site-wide inclusion must have its own client extension definition. The `assemble` block tells Liferay where to find the source `assets` and where to place them in the output (`static`).

```yaml
assemble:
  - from: assets
    into: static

my-main-css:
  name: "My Main CSS"
  type: globalCSS
  url: "css/my-main.css"

my-global-css:
  name: "My Global CSS"
  type: globalCSS
  url: "css/global.css"

my-global-js:
  name: "My Global JS"
  type: globalJS
  url: "js/global.js"
  async: true
  data-senna-track: permanent
  fetchpriority: low
```

### ❌ Incorrect YAML Structure

Do not group extensions under a single `client-extension` key or include top-level properties like `id` and `name` for the whole file. Also, do not attempt to list multiple CSS or JS files under a single `urls` property within one client extension definition; each file requires its own. This format is incorrect.

```yaml
# Incorrect! Do not use this format.
id: my-client-extension
name: My Client Extension

client-extension:
    - name: "My Global CSS"
      type: "globalCSS"
      url: "/css/global.css"
    - name: "My Global JS"
      type: "globalJS"
      url: "/js/global.js"
    # Also incorrect: using 'urls' for multiple files
    # my-global-css:
    #   name: "My Global CSS"
    #   type: globalCSS
    #   urls:
    #     - "/css/file1.css"
    #     - "/css/file2.css"
```

### Key Points
- Each extension requires its own unique top-level key (e.g., `my-main-css`, `my-global-css`).
- Each individual CSS or JavaScript file to be deployed site-wide requires its own distinct client extension definition.
- The `assemble` block tells Liferay where to find your asset files and where to copy them.


### Fragment Configuration Validation Errors:

- `options` field is deprecated - must use `typeOptions`
- `typeOptions` must be object with `validValues` array, not direct array
- Validation error: "expected type: JSONObject, found: JSONArray" means wrong structure

## Debug Steps for Failed Deployments

### Fragment Import Issues:

1. Verify `fragmentElement` is available in JavaScript
2. Check browser console for JavaScript errors
3. Inspect network requests for API calls
4. Validate HTML structure matches expected format
5. Test responsive breakpoints in browser dev tools

### Client Extension Issues:

1. Check client extension deployment status in admin panel
2. Verify CSS/JS files are accessible via direct URL
3. Inspect page source to confirm client extension resources are loaded
4. Test CSS scoping doesn't interfere with Liferay admin interface

### Configuration Issues:

1. Validate JSON syntax in configuration.json files
2. Check fragment.json metadata completeness
3. Verify thumbnail images are present and properly referenced
4. Test configuration options appear in fragment settings panel

## Performance Deployment Considerations

### Fragment Performance:
- Monitor Google Lighthouse scores after deployment
- Check Core Web Vitals for user experience metrics
- Optimize images and content as needed
- Verify mobile responsiveness across devices

### Resource Loading:
- Confirm client extensions load before fragment rendering
- Test fragment functionality with slow network connections
- Verify proper caching behavior for fragment resources
- Monitor JavaScript execution time and memory usage

## Security Deployment Checklist

### Security Considerations:
- Keep Liferay platform updated to latest stable version
- Monitor for security advisories related to client extensions
- Regularly review and update fragment content and links
- Verify CSRF protection is enabled for all API calls
- Test authentication flows in both logged-in and guest states

### Access Control:
- Configure proper permissions for fragment collections
- Set appropriate access levels for content editors
- Test fragment behavior with different user roles
- Verify sensitive content is properly protected

## Support and Maintenance

### Updates and Modifications:
- Fragment source code is available in the project repository
- Modify fragments as needed and re-create ZIP files using the provided Python script
- Deploy updated fragments to replace existing versions
- Test changes in staging environment before production deployment

### Monitoring and Analytics:
- Set up monitoring for fragment performance metrics
- Track user interactions with fragment components
- Monitor error rates and JavaScript exceptions
- Regularly review fragment usage analytics

### Documentation Maintenance:
- Keep deployment documentation updated with any changes
- Document custom modifications and configuration
- Maintain version history for fragments and client extensions
- Update troubleshooting guides based on support experiences

This comprehensive deployment guide ensures successful Liferay implementations with proper fragment and client extension deployment procedures.