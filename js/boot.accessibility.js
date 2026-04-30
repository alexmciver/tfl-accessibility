(() => {
    const script = document.createElement('script');
    if (window.location.protocol === 'file:') {
        script.src = 'js/accessibility.file.js';
    } else {
        script.type = 'module';
        script.src = 'js/accessibility.js';
    }
    document.body.appendChild(script);
})();
