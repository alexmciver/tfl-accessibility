export const initializeDarkMode = () => {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");

    // Function to apply dark mode based on preference
    const applyDarkMode = (isDarkMode) => {
        const header = document.querySelector('header');
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            header.classList.add('dark-mode');
            moonIcon.style.display = "none";
            sunIcon.style.display = "inline";
            darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            header.classList.remove('dark-mode');
            moonIcon.style.display = "inline";
            sunIcon.style.display = "none";
            darkModeToggle.checked = false;
        }
    };

    // Check localStorage for the user's preference or use system preference
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'enabled') {
        applyDarkMode(true);
    } else if (darkModePreference === 'disabled') {
        applyDarkMode(false);
    } else {
        // Check system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyDarkMode(systemPrefersDark);
    }

    // Event listener for the dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        const isChecked = darkModeToggle.checked;
        applyDarkMode(isChecked);
        localStorage.setItem('darkMode', isChecked ? 'enabled' : 'disabled');
    });
}; 