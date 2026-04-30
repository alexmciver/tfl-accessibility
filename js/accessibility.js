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

document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    initializeBackToTop();
});
