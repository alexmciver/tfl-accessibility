/**
 * Legacy entry — the planner is one build for file:// and http(s).
 * Prefer js/boot.js → js/tfl.bundle.js.
 */
(() => {
    const script = document.createElement('script');
    script.src = 'js/tfl.bundle.js';
    document.body.appendChild(script);
})();
