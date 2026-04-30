(function () {
    const initializeDarkMode = () => {
        const darkModeToggle = document.getElementById("dark-mode-toggle");
        const sunIcon = document.getElementById("sun-icon");
        const moonIcon = document.getElementById("moon-icon");
        const header = document.querySelector('header');

        if (!darkModeToggle || !sunIcon || !moonIcon || !header) {
            return;
        }

        const applyDarkMode = (isDarkMode) => {
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

        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'enabled') {
            applyDarkMode(true);
        } else if (darkModePreference === 'disabled') {
            applyDarkMode(false);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            applyDarkMode(systemPrefersDark);
        }

        darkModeToggle.addEventListener('change', () => {
            const isChecked = darkModeToggle.checked;
            applyDarkMode(isChecked);
            localStorage.setItem('darkMode', isChecked ? 'enabled' : 'disabled');
        });
    };

    const backToTopButton = document.getElementById("back-to-top");

    const initializeBackToTop = () => {
        if (!backToTopButton) {
            return;
        }

        window.onscroll = function () {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
                backToTopButton.style.display = "block";
            } else {
                backToTopButton.style.display = "none";
            }
        };

        backToTopButton.addEventListener("click", function () {
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
}());
