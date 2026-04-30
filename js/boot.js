(() => {
    const script = document.createElement('script');
    if (window.location.protocol === 'file:') {
        script.src = 'js/tfl.file.js';
    } else {
        script.type = 'module';
        script.src = 'js/tfl.js';
    }
    document.body.appendChild(script);
})();
