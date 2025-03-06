/**
 * Accessibility.js - Handles UI enhancements and accessibility features
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set the current year in the footer
  const currentYearElements = document.querySelectorAll('#current-year');
  const currentYear = new Date().getFullYear();
  
  if (currentYearElements) {
    currentYearElements.forEach(element => {
      element.textContent = currentYear;
    });
  }

  // Mobile navigation toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const mainMenu = document.getElementById('main-menu');
  
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', (event) => {
      // Prevent event from bubbling up
      event.stopPropagation();
      
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      
      // Toggle the show class on the menu
      mainMenu.classList.toggle('show');
      
      // Toggle icon between bars and X
      const icon = menuToggle.querySelector('i');
      if (icon) {
        if (icon.classList.contains('fa-bars')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (mainMenu.classList.contains('show') && !event.target.closest('.main-nav')) {
        mainMenu.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
        
        const icon = menuToggle.querySelector('i');
        if (icon && icon.classList.contains('fa-times')) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
    
    // Prevent menu from closing when clicking on menu items
    mainMenu.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }
  
  // Back to top button functionality
  const backToTopButton = document.getElementById('back-to-top');
  
  if (backToTopButton) {
    // Show/hide back to top button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    });
    
    // Scroll to top when button is clicked
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Focus management for modals and overlays
  const overlay = document.getElementById('overlay');
  if (overlay) {
    // If overlay is visible, trap focus within it
    const handleOverlayFocus = () => {
      if (overlay.style.display !== 'none' && !overlay.classList.contains('hidden')) {
        const focusableElements = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          // Trap focus in the overlay
          overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
              if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
            
            // Close on Escape key
            if (e.key === 'Escape') {
              if (typeof hideOverlay === 'function') {
                hideOverlay();
              }
            }
          });
          
          // Focus the first focusable element when overlay is shown
          setTimeout(() => {
            firstElement.focus();
          }, 100);
        }
      }
    };
    
    // Call once on load for initial state
    handleOverlayFocus();
    
    // Set up mutation observer to detect when overlay becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
          handleOverlayFocus();
        }
      });
    });
    
    observer.observe(overlay, { attributes: true });
  }
  
  // Enhanced focus styles for accessibility
  document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(element => {
    element.addEventListener('focus', () => {
      element.dataset.focused = 'true';
    });
    
    element.addEventListener('blur', () => {
      element.dataset.focused = 'false';
    });
  });
}); 