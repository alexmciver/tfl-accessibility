// Error types
export const ErrorTypes = {
    MAPS_INITIALIZATION: 'MAPS_INITIALIZATION',
    DIRECTIONS_SERVICE: 'DIRECTIONS_SERVICE',
    STATION_DATA: 'STATION_DATA',
    NETWORK: 'NETWORK',
    VALIDATION: 'VALIDATION'
};

// Custom error messages
const ErrorMessages = {
    [ErrorTypes.MAPS_INITIALIZATION]: 'Failed to initialize Google Maps',
    [ErrorTypes.DIRECTIONS_SERVICE]: 'Failed to get directions',
    [ErrorTypes.STATION_DATA]: 'Failed to load station data',
    [ErrorTypes.NETWORK]: 'Network error occurred',
    [ErrorTypes.VALIDATION]: 'Invalid input'
};

// Error handling function
export const handleError = (error, type = ErrorTypes.NETWORK) => {
    const errorMessage = ErrorMessages[type] || 'An unexpected error occurred';
    
    // Log error for debugging
    console.error(`${errorMessage}:`, error);

    // Show user-friendly message
    showErrorMessage(`${errorMessage}. Please try again later.`);
};

// User-friendly error display
const showErrorMessage = (message) => {
    // Remove any existing error messages
    clearErrorMessages();

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;

    // Add to DOM
    document.getElementById('main-content').prepend(errorDiv);

    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
};

// Clear existing error messages
const clearErrorMessages = () => {
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
};

// Google Maps specific error handler
export const handleMapsError = (status) => {
    const statusErrors = {
        ZERO_RESULTS: 'No route found between these stations.',
        NOT_FOUND: 'One or both stations could not be found.',
        OVER_QUERY_LIMIT: 'Too many requests. Please try again later.',
        REQUEST_DENIED: 'Request was denied.',
        INVALID_REQUEST: 'Invalid request.',
        UNKNOWN_ERROR: 'An unknown error occurred.',
        MAX_WAYPOINTS_EXCEEDED: 'Too many waypoints in the route.',
        MAX_ROUTE_LENGTH_EXCEEDED: 'The route is too long.',
    };

    const errorMessage = statusErrors[status] || 'An error occurred while planning the route.';
    handleError(new Error(errorMessage), ErrorTypes.DIRECTIONS_SERVICE);
}; 