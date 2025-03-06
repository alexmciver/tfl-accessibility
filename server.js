const express = require('express');
const compression = require('compression');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable compression for all responses
app.use(compression({
  // Compression level (0-9)
  level: 6,
  // Only compress responses larger than 1KB
  threshold: 1024,
  // Don't compress responses with these headers
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Don't compress responses with this request header
      return false;
    }
    // Fallback to standard compression
    return compression.filter(req, res);
  }
}));

// Serve static files from the dist directory with proper cache control
app.use(express.static(path.join(__dirname, 'dist'), {
  etag: true,
  lastModified: true,
  maxAge: '1y', // Cache for 1 year
  setHeaders: (res, path) => {
    // Add Vary header to help with caching
    res.setHeader('Vary', 'Accept-Encoding');
    
    // Set proper cache control headers based on file type
    if (path.endsWith('.html')) {
      // Don't cache HTML files for too long to ensure latest content
      res.setHeader('Cache-Control', 'public, max-age=0');
    } else if (path.match(/\.(css|js|json|svg|png|jpg|jpeg|gif|webp|ico)$/)) {
      // Cache assets with a hash in filename for a year
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Handle all routes by serving index.html (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`TFL Accessibility server running on port ${PORT}`);
  console.log(`With compression enabled for text-based resources`);
}); 