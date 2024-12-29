import { fetchTFL } from './tfl.js';
import { applyDarkMode, initializeDarkMode } from './modules/darkMode.js';

// Initialize dark mode on page load
initializeDarkMode();

// Event listener for the dark mode toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('change', () => {
    const isChecked = darkModeToggle.checked;
    applyDarkMode(isChecked);
    localStorage.setItem('darkMode', isChecked ? 'enabled' : 'disabled');
});

// Back to top button functionality
const backToTopButton = document.getElementById("back-to-top");

window.onscroll = function() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

backToTopButton.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Initialize TFL functionality
fetchTFL();
