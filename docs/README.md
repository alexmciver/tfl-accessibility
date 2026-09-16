# TfL Accessibility - Free Flow Routes

Accessible journey planner for London travel with step-free-aware routing guidance.

## MVP Scope

- Static app (HTML, CSS, JavaScript only).
- Works in both `file://` mode and hosted `http/https` mode.
- Uses bundled station/accessibility data, with optional live TfL lift and step-free journey data when an app key is set.
- Builds route guidance for accessibility scenarios including `Full`, `Partial`, `Interchange`, and `None`.

## Run the App

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

- Journey planner: `index.html`
- Accessibility guide: `accessibility.html`
- GitHub Pages deploys automatically from `main` via `.github/workflows/githubpages.yml`

## Main Files

- `index.html`: Journey planner UI.
- `accessibility.html`: Accessibility explainer page.
- `css/style.css`: App styling.
- `data/stations.json`: Station accessibility dataset.
- `js/tfl.js`: Planner logic for hosted mode.
- `js/tfl.file.js`: Planner logic for `file://` mode.
- `js/modules/routingEngine.js`: Scenario strategy generation and route option ranking.
- `js/modules/liveContext.js`: Live or fallback context for lifts, hubs, and departures.
- `js/modules/tflApi.js`: TfL Unified API client (lifts, StopPoint search, arrivals, journey planner).
- `js/modules/accessProfile.js`: Persisted personal access preferences.
- `js/modules/confidenceEngine.js`: Access confidence scoring, leg certainty, assistance briefing.

## Tests

```bash
node js/tests/routingEngine.test.mjs
node js/tests/tflApi.test.mjs
node js/tests/scenarioAudit.mjs
node js/tests/accessTrust.test.mjs
```

- `routingEngine.test.mjs`: policy and map checks across accessibility category pairs.
- `scenarioAudit.mjs`: prints every scenario sample (`Full` / `Interchange` / `Partial` / `None`) and fails if an inaccessible origin still appears as the map start.
- `accessTrust.test.mjs`: Free Flow vs TfL trust layer, wheelchair Interchange policy, None→Full guidance.
- `surfaceLearning.test.mjs`: Clapham-style local surface routes + on-device learning feedback.
- `tflApi.test.mjs`: lift-disruption matching helpers.

## On-device learning

Free Flow stores lessons in `localStorage` (`freeflow_route_memory_v1`) on this device only:

1. **Auto-learn** when a plan uses surface-first or hub corrections.
2. **User feedback** via “This plan helped”, “Should be bus / walk”, or “Wrong hub / Tube detour”.
3. Later plans reuse learned surface pairs and hub tips.

Hubs are **not hard-coded**. `hubResolver.js` picks the best published `Full` station using locality/name similarity, then prefers any learned Full hub.

## Why Free Flow can beat TfL journey results

TfL Journey Planner’s `StepFreeToPlatform` preference is **not** the same as street-to-train access. Free Flow:

1. Uses published station categories (`Full` / `Partial` / `Interchange` / `None`) as a hard gate.
2. Forces accessible hubs when street access is constrained — including wheelchair + Interchange origins.
3. Prefers access-first hub plans over raw TfL timing when those gates fire.
4. Surfaces an explicit “corrected TfL street-access gaps” banner so travellers know why the plan differs.

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

## TfL Live Data Behaviour

On hosted `http`/`https`, the planner calls the TfL Unified API for lift disruptions and step-free journey options. An app key is optional (higher rate limits) — register at https://api.tfl.gov.uk/:

```html
<script src="js/runtime-keys.js"></script>
<script>
  // Or set keys in js/runtime-keys.js (copy from runtime-keys.example.js)
  window.FREEFLOW_TFL_APP_KEY = 'YOUR_TFL_APP_KEY';
</script>
```

- The **Are the lifts working?** panel shows Working / Disruption / Unavailable using live TfL lift data.
- On fetch failure or `file://`, the app keeps deterministic hub guidance, marks results as degraded, and clearly says live lift status is unavailable.
- Live TfL calls are not used by `js/tfl.file.js`.

## Security Notes

- External links opened in a new tab use `rel="noopener noreferrer"`.
- Dynamic UI strings are HTML-escaped before being inserted into template-based markup.
- Inline JavaScript has been removed from HTML entry pages and moved to dedicated bootstrap files.