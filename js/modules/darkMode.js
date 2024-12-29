export const applyDarkMode = (isDarkMode) => {
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.checked = false;
    }
};

export const initializeDarkMode = () => {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'enabled') {
        applyDarkMode(true);
    } else if (darkModePreference === 'disabled') {
        applyDarkMode(false);
    } else {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyDarkMode(systemPrefersDark);
    }
}; 