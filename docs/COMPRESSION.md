# Text Compression for TFL Accessibility Website

This document explains how text compression is implemented in the TFL Accessibility website to minimize total network bytes and improve page load times.

## Compression Methods Implemented

The website uses three compression methods:

1. **Gzip**: Widely supported by all browsers
2. **Brotli**: Better compression than Gzip, supported by modern browsers
3. **Deflate**: Implemented at the server level as a fallback

## Build Process Implementation

Compression is automatically applied during the build process using Gulp. When you run `gulp build`, the following happens:

1. Text-based resources (HTML, CSS, JS) are minified
2. Gzip and Brotli compressed versions are generated with the extensions `.gz` and `.br`
3. The original files are kept for browsers that don't support compression

### Compression Settings

- **Gzip**: Compression level 9 (maximum)
- **Brotli**: Quality level 11 (maximum), with skipLarger option to ensure compressed files are always smaller

## Server Configuration

### Apache (.htaccess)

The `.htaccess` file includes rules for:

- Dynamic compression of text-based resources using mod_deflate
- Content negotiation to serve pre-compressed static files
- Setting appropriate content-encoding headers
- Cache control headers for improved performance

### Node.js (Express)

If using the Node.js server (server.js), compression is enabled using the `compression` middleware:

- Compression level: 6 (good balance between speed and compression ratio)
- Threshold: 1KB (only compresses responses larger than 1KB)
- Appropriate cache control headers are set

## Testing Compression

You can test if compression is working correctly using:

1. **Browser DevTools**: Check the Network tab to see if resources have a "Content-Encoding" header with values like "gzip" or "br"
2. **cURL**: Use commands like:
   ```
   curl -H "Accept-Encoding: gzip" -I https://your-site.com/path/to/file.css
   ```

## Troubleshooting

If compression isn't working:

1. Ensure Apache modules (mod_deflate, mod_headers, mod_rewrite) are enabled
2. Check if `.htaccess` files are allowed (AllowOverride All)
3. Verify that the compression functions are included in the Gulp build process
4. For Node.js, ensure the compression middleware is applied before serving static files

## Performance Impact

Implementing text compression typically results in:

- 60-80% reduction in text-based file sizes
- Faster page load times, especially on slower connections
- Reduced bandwidth costs
- Improved user experience for people with disabilities using mobile data

## Accessibility Considerations

Text compression is an important accessibility feature for:

- Users on limited data plans
- Users in areas with poor connectivity
- Mobile users with disabilities who rely on accessible websites
- Users of assistive technologies that need to download additional resources 