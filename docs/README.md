# TfL Accessibility - Free Flow Routes

Accessible journey planner for London travel with step-free-aware routing guidance.

## MVP Scope

- Static app (HTML, CSS, JavaScript only).
- Works in both `file://` mode and hosted `http/https` mode.
- Uses bundled station/accessibility data (no runtime third-party accessibility API dependency).
- Builds route guidance for accessibility scenarios including `Full`, `Partial`, `Interchange`, and `None`.

## Run the App

- Open `index.html` directly, or host the folder with any static web server.
- Accessibility guide is in `accessibility.html`.

## Main Files

- `index.html`: Journey planner UI.
- `accessibility.html`: Accessibility explainer page.
- `css/style.css`: App styling.
- `data/stations.json`: Station accessibility dataset.
- `js/tfl.js`: Planner logic for hosted mode.
- `js/tfl.file.js`: Planner logic for `file://` mode.
- `js/modules/routingEngine.js`: Scenario strategy generation and route option ranking.
- `js/modules/liveContext.js`: Deterministic context generator for lift/departure guidance.

## Google Maps Behaviour

To avoid exposing secrets, no API key is stored in source code.

- Optional runtime key:
```html
<script>
  window.FREEFLOW_GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_EMBED_KEY';
</script>
```
- With a key, the app uses Google Embed Directions URLs.
- Without a key, the app uses keyless embedded map queries so map previews still render.

## Security Notes

- External links opened in a new tab use `rel="noopener noreferrer"`.
- Dynamic UI strings are HTML-escaped before being inserted into template-based markup.
- Inline JavaScript has been removed from HTML entry pages and moved to dedicated bootstrap files.