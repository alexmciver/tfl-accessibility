(() => {
    const script = document.createElement('script');
    // Keep planner boot ordered after runtime-keys (async=false).
    script.src = 'js/tfl.bundle.js';
    script.async = false;
    document.body.appendChild(script);
})();
