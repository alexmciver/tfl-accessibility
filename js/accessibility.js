import { initializeDarkMode } from './modules/darkMode.js';

const backToTopButton = document.getElementById("back-to-top");

const initializeBackToTop = () => {
    if (!backToTopButton) {
        return;
    }

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
};

const bootAccessibilityPage = () => {
    if (window.__freeflowAccessibilityInitialized) return;
    window.__freeflowAccessibilityInitialized = true;
    initializeDarkMode();
    initializeBackToTop();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAccessibilityPage);
} else {
    bootAccessibilityPage();
}