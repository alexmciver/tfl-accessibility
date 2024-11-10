export const RouteErrors = {
    INVALID_STATIONS: {
        title: 'Invalid Station Selection',
        message: 'Please select both a start and end station.'
    },
    SAME_STATION: {
        title: 'Invalid Route',
        message: 'Start and end stations cannot be the same. Please select different stations.'
    },
    ROUTE_NOT_FOUND: {
        title: 'Route Not Found',
        message: 'Unable to find a route between these stations. Please try different stations.'
    },
    MAP_LOAD_FAILED: {
        title: 'Map Loading Failed',
        message: 'Unable to load the map. Please check your internet connection and try again.'
    },
    GENERAL_ERROR: {
        title: 'Error',
        message: 'An unexpected error occurred. Please try again later.'
    }
};

export const showErrorMessage = (error, container) => {
    console.log('Showing error message:', error); // Debug log
    
    // Remove any existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    
    // Create title
    const titleElement = document.createElement('strong');
    titleElement.textContent = error.title;
    
    // Create message
    const messageElement = document.createElement('p');
    messageElement.textContent = error.message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'error-close';
    closeButton.setAttribute('aria-label', 'Close error message');
    
    // Assemble error message
    errorDiv.appendChild(closeButton);
    errorDiv.appendChild(titleElement);
    errorDiv.appendChild(messageElement);
    
    // Add to container
    container.insertBefore(errorDiv, container.firstChild);
    
    // Add close button functionality
    closeButton.addEventListener('click', () => {
        errorDiv.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}; 