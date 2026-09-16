(() => {
    const script = document.createElement('script');
    // One planner build for file:// and http(s) — same live lifts, maps, and guidance.
    script.src = 'js/tfl.bundle.js';
    document.body.appendChild(script);
})();
