// Main JavaScript functionality for Free Flow Routes
document.addEventListener('DOMContentLoaded', function() {
    initDarkModeToggle();
    initMenuToggle();
    initBackToTop();
    initCopyrightYear();
    initOverlay();
    initFormHandling();
    initAccessibilityFeatures();
});

// Initialize dark mode toggle functionality
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved theme preference or use system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true;
    }
    
    // Add event listener for toggle change
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-mode');
                if (darkModeToggle) darkModeToggle.checked = true;
            } else {
                document.body.classList.remove('dark-mode');
                if (darkModeToggle) darkModeToggle.checked = false;
            }
        }
    });
}

// Initialize mobile menu toggle
function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav ul');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('show');
            
            // Update ARIA expanded state
            const isExpanded = mainNav.classList.contains('show');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Toggle between hamburger and X icon
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (isExpanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.main-nav') && mainNav.classList.contains('show')) {
                mainNav.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', false);
                
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

// Initialize back to top button
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when button is clicked
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Set the current year in the footer copyright text
function initCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.textContent = currentYear;
    }
}

// Initialize the intro overlay functionality
function initOverlay() {
    const overlay = document.querySelector('.overlay');
    
    if (overlay) {
        // Initialize the overlay
        setTimeout(() => {
            // Close overlay when clicking anywhere
            overlay.addEventListener('click', function() {
                overlay.classList.add('hidden');
                // Completely remove it after transition completes
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 500);
            });
            
            // Close overlay with ESC key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
                    overlay.classList.add('hidden');
                    // Completely remove it after transition completes
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 500);
                }
            });
        }, 1000); // Small delay for dramatic effect
    }
}

// Combined form handling function for all forms
function initFormHandling() {
    // Dynamic label behavior for form inputs
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        // Handle focus state
        input.addEventListener('focus', function() {
            const parent = this.closest('.form-group');
            if (parent) parent.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            const parent = this.closest('.form-group');
            if (parent) parent.classList.remove('focused');
        });
        
        // Check for pre-filled values
        if (input.value) {
            const parent = input.closest('.form-group');
            if (parent) parent.classList.add('has-value');
        }
        
        // Handle changes to inputs
        input.addEventListener('input', function() {
            const parent = this.closest('.form-group');
            if (parent) {
                if (this.value) {
                    parent.classList.add('has-value');
                } else {
                    parent.classList.remove('has-value');
                }
            }
        });
    });
    
    // Common validation functions
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    
    const showError = (element, message) => {
        // Remove existing error
        const existingError = element.parentNode.querySelector('.error-message, .validation-message');
        if (existingError) existingError.remove();
        
        // Add error class to element
        element.classList.add('error', 'invalid');
        
        // Create error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        element.parentNode.appendChild(errorElement);
    };
    
    const clearError = (element) => {
        const errorElement = element.parentNode.querySelector('.error-message, .validation-message');
        if (errorElement) errorElement.remove();
        element.classList.remove('error', 'invalid');
    };
    
    // Show success message
    const showFormSuccess = (form) => {
        const successElement = document.createElement('div');
        successElement.className = 'form-success';
        successElement.innerHTML = '<i class="fas fa-check-circle"></i> Your message has been sent successfully!';
        
        form.insertAdjacentElement('beforebegin', successElement);
        
        // Reset form
        form.reset();
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successElement.style.opacity = '0';
            setTimeout(() => {
                successElement.remove();
            }, 500);
        }, 5000);
    };
    
    // Handle contact form submissions
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate form fields
            let isValid = true;
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            // Simple validation checks
            if (!name.value.trim()) {
                isValid = false;
                showError(name, 'Please enter your name');
            } else {
                clearError(name);
            }
            
            if (!email.value.trim()) {
                isValid = false;
                showError(email, 'Please enter your email');
            } else if (!isValidEmail(email.value)) {
                isValid = false;
                showError(email, 'Please enter a valid email address');
            } else {
                clearError(email);
            }
            
            if (!message.value.trim()) {
                isValid = false;
                showError(message, 'Please enter your message');
            } else {
                clearError(message);
            }
            
            if (isValid) {
                showFormSuccess(this);
            }
        });
    }
    
    // Handle route search form
    const routeForm = document.getElementById('route-search-form');
    if (routeForm) {
        routeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form inputs
            const start = document.getElementById('start').value;
            const destination = document.getElementById('destination').value;
            
            // Validate basic inputs
            if (!start || !destination) {
                alert('Please enter both starting point and destination');
                return;
            }
            
            // Show loading state
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            loadingSpinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
            const mapView = document.querySelector('.map-view');
            if (mapView) mapView.prepend(loadingSpinner);
            
            // Update route info
            const routeInfo = document.querySelector('.route-info');
            if (routeInfo) routeInfo.textContent = `Route from ${start} to ${destination}`;
            
            // Simulate API load time (this would be replaced with actual API calls)
            setTimeout(() => {
                // Update journey stats
                const timeValue = document.querySelector('.time-value');
                const distanceValue = document.querySelector('.distance-value');
                const accessibilityValue = document.querySelector('.accessibility-value');
                
                if (timeValue) timeValue.textContent = '35 min';
                if (distanceValue) distanceValue.textContent = '2.4 km';
                if (accessibilityValue) accessibilityValue.textContent = 'Step-free';
                
                // Update route steps
                const stepList = document.querySelector('.step-list');
                if (stepList) {
                    stepList.innerHTML = ''; // Clear placeholder
                    
                    // Sample route steps
                    const steps = [
                        { text: 'Start at ' + start, icon: 'fa-map-marker-alt', note: null },
                        { text: 'Walk 200m to Bus Stop A', icon: 'fa-walking', note: 'Step-free path available' },
                        { text: 'Take Bus 42 towards City Centre', icon: 'fa-bus', note: 'This bus has wheelchair access' },
                        { text: 'Ride for 5 stops (12 minutes)', icon: 'fa-clock', note: null },
                        { text: 'Get off at Station Road', icon: 'fa-sign', note: null },
                        { text: 'Walk 150m to ' + destination, icon: 'fa-walking', note: 'Curb cuts and tactile paving present' },
                        { text: 'Arrive at destination', icon: 'fa-flag-checkered', note: null }
                    ];
                    
                    // Add steps to the list
                    steps.forEach(step => {
                        const li = document.createElement('li');
                        let stepHTML = `<i class="fas ${step.icon}"></i>${step.text}`;
                        
                        if (step.note) {
                            stepHTML += `<div class="accessibility-notes"><i class="fas fa-universal-access"></i>${step.note}</div>`;
                        }
                        
                        li.innerHTML = stepHTML;
                        stepList.appendChild(li);
                    });
                }
                
                // Remove loading spinner
                loadingSpinner.remove();
                
                // Update map iframe (in a real app, would center on the route)
                const mapFrame = document.getElementById('map');
                if (mapFrame) {
                    mapFrame.src = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9932.19033181828!2d-0.12210994556849454!3d51.5077886674733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604ce3941eb1f%3A0x1a5342fdf089c627!2sTrafalgar%20Square!5e0!3m2!1sen!2suk!4v1661723302277!5m2!1sen!2suk";
                }
                
                // Scroll to map view
                const mapWrapper = document.querySelector('.map-wrapper');
                if (mapWrapper) mapWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 1500);
        });
    }
}

// Initialize accessibility features
function initAccessibilityFeatures() {
    // Set wheelchair accessibility as default in dropdown
    const accessibilitySelect = document.getElementById('accessibility-needs');
    if (accessibilitySelect) {
        // Set default to wheelchair
        if (accessibilitySelect.value === '') {
            accessibilitySelect.value = 'wheelchair';
        }
        
        // Add event listener to show toast when changed
        accessibilitySelect.addEventListener('change', function() {
            // Show reminder that all routes are wheelchair accessible by default
            if (this.value !== 'wheelchair' && this.value !== '') {
                showToast('All routes include wheelchair accessibility by default');
            }
        });
    }
    
    // Add keyboard navigation for accessibility features
    const accessibilityCommitment = document.querySelector('.accessibility-commitment');
    if (accessibilityCommitment) {
        accessibilityCommitment.setAttribute('tabindex', '0');
        accessibilityCommitment.setAttribute('role', 'note');
        accessibilityCommitment.setAttribute('aria-label', 'Accessibility commitment: All routes are wheelchair accessible by default');
    }
    
    // Add ARIA labels to the search form
    const routeSearchForm = document.getElementById('route-search-form');
    if (routeSearchForm) {
        routeSearchForm.setAttribute('aria-label', 'Find wheelchair accessible routes');
        
        const startInput = document.getElementById('start');
        const destinationInput = document.getElementById('destination');
        
        if (startInput) {
            startInput.setAttribute('aria-label', 'Starting point for wheelchair accessible route');
        }
        
        if (destinationInput) {
            destinationInput.setAttribute('aria-label', 'Destination for wheelchair accessible route');
        }
    }
    
    // Add descriptive labels to social links
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks.forEach(link => {
        const icon = link.querySelector('i');
        if (icon) {
            let socialNetwork = '';
            if (icon.classList.contains('fa-facebook')) socialNetwork = 'Facebook';
            if (icon.classList.contains('fa-twitter')) socialNetwork = 'Twitter';
            if (icon.classList.contains('fa-instagram')) socialNetwork = 'Instagram';
            if (icon.classList.contains('fa-linkedin')) socialNetwork = 'LinkedIn';
            
            if (socialNetwork) {
                link.setAttribute('aria-label', `Visit our ${socialNetwork} page`);
            }
        }
    });
}

// Show toast message
function showToast(message) {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fas fa-wheelchair"></i>
        <span>${message}</span>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show the toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
} 