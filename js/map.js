// Map Functionality for Free Flow Routes
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map functionality
    initMap();
});

// Initialize map functionality
function initMap() {
    // Cache DOM elements
    const elements = {
        mapWrapper: document.querySelector('.map-wrapper'),
        routeSummary: document.querySelector('.route-summary'),
        routeSteps: document.querySelector('.route-steps'),
        routeInfo: document.querySelector('.route-info'),
        journeyStats: document.querySelector('.journey-stats'),
        stepList: document.querySelector('.step-list'),
        zoomInBtn: document.getElementById('zoom-in'),
        zoomOutBtn: document.getElementById('zoom-out'),
        fullscreenBtn: document.getElementById('fullscreen'),
        printBtn: document.getElementById('print-route'),
        shareBtn: document.getElementById('share-route'),
        saveBtn: document.getElementById('save-route'),
        accessibilitySelect: document.getElementById('accessibility-needs'),
        accessibilityCommitment: document.querySelector('.accessibility-commitment p')
    };

    // Update accessibility commitment text if element exists
    if (elements.accessibilityCommitment) {
        elements.accessibilityCommitment.innerHTML = '<strong>All routes are wheelchair accessible by default</strong> - we prioritize full accessibility in our journey planning';
    }

    // Accessibility constants
    const ACCESSIBILITY_TYPES = {
        WHEELCHAIR: 'wheelchair',
        STEP_FREE: 'step-free',
        ELEVATOR: 'elevator',
        VISUAL: 'visual',
        AUDIO: 'audio'
    };

    // Accessibility icons mapping
    const ACCESSIBILITY_ICONS = {
        [ACCESSIBILITY_TYPES.WHEELCHAIR]: 'wheelchair',
        [ACCESSIBILITY_TYPES.STEP_FREE]: 'walking',
        [ACCESSIBILITY_TYPES.ELEVATOR]: 'elevator',
        [ACCESSIBILITY_TYPES.VISUAL]: 'eye',
        [ACCESSIBILITY_TYPES.AUDIO]: 'volume-up'
    };

    // Accessibility descriptions
    const ACCESSIBILITY_DESCRIPTIONS = {
        [ACCESSIBILITY_TYPES.WHEELCHAIR]: 'Wheelchair accessible route',
        [ACCESSIBILITY_TYPES.STEP_FREE]: 'Step-free access',
        [ACCESSIBILITY_TYPES.ELEVATOR]: 'Elevator available',
        [ACCESSIBILITY_TYPES.VISUAL]: 'Visual assistance features',
        [ACCESSIBILITY_TYPES.AUDIO]: 'Audio assistance features'
    };

    // Placeholder routes data - ALL are wheelchair accessible by default
    const sampleRoutes = [
        {
            id: 1,
            name: "King's Cross to British Museum",
            description: "A wheelchair-accessible journey from King's Cross Station to the British Museum",
            duration: "18 mins",
            distance: "1.2 miles",
            accessibility: "Full wheelchair access",
            accessibilityTypes: [ACCESSIBILITY_TYPES.WHEELCHAIR, ACCESSIBILITY_TYPES.STEP_FREE, ACCESSIBILITY_TYPES.ELEVATOR],
            accessibilityRating: 95,
            steps: [
                "Exit King's Cross Station via the step-free Euston Road exit",
                "Use the accessible crossing at Euston Road",
                "Head south on Upper Woburn Place using the wheelchair-friendly pavement",
                "Turn right onto Tavistock Square - wide pavements available",
                "Continue onto Russell Square via the accessible route",
                "The British Museum has a step-free entrance on Great Russell Street"
            ],
            accessibilityNotes: "This route has been verified for wheelchair users. All crossings have dropped curbs and tactile paving. The British Museum has accessible toilets and elevators to all floors."
        },
        {
            id: 2,
            name: "South Kensington to Harrods",
            description: "A wheelchair-accessible route from South Kensington Station to Harrods",
            duration: "12 mins",
            distance: "0.7 miles",
            accessibility: "Full wheelchair access",
            accessibilityTypes: [ACCESSIBILITY_TYPES.WHEELCHAIR, ACCESSIBILITY_TYPES.STEP_FREE],
            accessibilityRating: 90,
            steps: [
                "Exit South Kensington Station via the step-free Exhibition Road exit",
                "Head east on Cromwell Place using the accessible pavement",
                "Turn left onto Brompton Road - wide pavements available for wheelchair users",
                "Continue on Brompton Road for 0.5 miles - all crossings have dropped curbs",
                "Harrods main entrance on Brompton Road has a wheelchair-accessible entrance"
            ],
            accessibilityNotes: "This route has been verified for wheelchair users. Harrods has accessible entrances, elevators, and facilities throughout the store."
        },
        {
            id: 3,
            name: "Westminster to London Eye",
            description: "A wheelchair-accessible journey along the Thames from Westminster to the London Eye",
            duration: "10 mins",
            distance: "0.5 miles",
            accessibility: "Full wheelchair access",
            accessibilityTypes: [ACCESSIBILITY_TYPES.WHEELCHAIR, ACCESSIBILITY_TYPES.STEP_FREE, ACCESSIBILITY_TYPES.VISUAL],
            accessibilityRating: 100,
            steps: [
                "Exit Westminster Station via the step-free exit (follow wheelchair symbols)",
                "Cross Westminster Bridge Road using the accessible crossing",
                "Take the accessible path to the Queen's Walk along the Thames",
                "Follow the flat, wide riverside path towards the London Eye",
                "The London Eye has a dedicated wheelchair access entrance"
            ],
            accessibilityNotes: "This route is fully wheelchair accessible with a smooth, flat path along the Thames. The London Eye provides priority boarding for wheelchair users and has accessible viewing pods."
        }
    ];

    // Set up zoom controls
    setupZoomControls(elements);
    
    // Set up action buttons (print, share, save)
    setupActionButtons(elements);

    // Simulate route drawing on map
    function simulateRouteDrawing() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'flex';
            
            setTimeout(() => {
                elements.loadingOverlay.style.display = 'none';
                showToast('Wheelchair accessible route loaded successfully');
            }, 1200);
        }
    }

    // Show toast messages
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
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        // Add to container
        toastContainer.appendChild(toast);
        
        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Setup route action buttons
    function setupActionButtons({printBtn, shareBtn, saveBtn}) {
        if (printBtn) {
            printBtn.addEventListener('click', function() {
                showToast('Printing route instructions...');
                window.print();
            });
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                if (navigator.share) {
                    navigator.share({
                        title: 'Accessible Route Directions',
                        text: 'Check out this accessible route I found!',
                        url: window.location.href
                    })
                    .then(() => showToast('Route shared successfully'))
                    .catch(() => showToast('Share cancelled'));
                } else {
                    // Fallback for browsers that don't support Web Share API
                    showToast('Copy this link to share: ' + window.location.href);
                    
                    // Create temporary input to copy URL
                    const tempInput = document.createElement('input');
                    tempInput.value = window.location.href;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand('copy');
                    document.body.removeChild(tempInput);
                    
                    showToast('Link copied to clipboard');
                }
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                showToast('Route saved to your favorites');
            });
        }
    }

    // Set up zoom controls
    function setupZoomControls({zoomInBtn, zoomOutBtn, fullscreenBtn, mapWrapper}) {
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                const mapFrame = document.getElementById('map');
                // In a real implementation, this would zoom the map
                // For now, just show a visual feedback
                if (mapFrame) {
                    mapFrame.classList.add('zoom-effect');
                    setTimeout(() => mapFrame.classList.remove('zoom-effect'), 300);
                }
                
                showToast('Zoom in functionality would be implemented here');
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                const mapFrame = document.getElementById('map');
                // In a real implementation, this would zoom out the map
                if (mapFrame) {
                    mapFrame.classList.add('zoom-out-effect');
                    setTimeout(() => mapFrame.classList.remove('zoom-out-effect'), 300);
                }
                
                showToast('Zoom out functionality would be implemented here');
            });
        }
        
        if (fullscreenBtn && mapWrapper) {
            fullscreenBtn.addEventListener('click', function() {
                toggleFullscreen(mapWrapper);
            });
        }
    }

    // Toggle fullscreen for the map
    function toggleFullscreen(element) {
        if (!document.fullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    // Display route details
    function displayRouteDetails(route) {
        if (!route) return;
        
        // Always ensure routes have wheelchair accessibility
        if (!route.accessibilityTypes.includes(ACCESSIBILITY_TYPES.WHEELCHAIR)) {
            route.accessibilityTypes.push(ACCESSIBILITY_TYPES.WHEELCHAIR);
        }
        
        // Update route info
        if (elements.routeInfo) {
            elements.routeInfo.innerHTML = `
                <h3>${route.name}</h3>
                <p>${route.description}</p>
                <div class="accessibility-badge">
                    <i class="fas fa-wheelchair"></i> Wheelchair Accessible Route
                </div>
            `;
        }
        
        // Update journey stats
        const timeValue = document.querySelector('.time-value');
        const distanceValue = document.querySelector('.distance-value');
        const accessibilityValue = document.querySelector('.accessibility-value');
        
        if (timeValue) timeValue.textContent = route.duration;
        if (distanceValue) distanceValue.textContent = route.distance;
        if (accessibilityValue) {
            // Create accessibility rating with visual indicator
            const rating = route.accessibilityRating || 100; // Default to 100% if not specified
            accessibilityValue.innerHTML = `
                <span class="accessibility-rating-value">${rating}%</span>
                <div class="accessibility-rating-bar">
                    <div class="accessibility-rating-fill" style="width: ${rating}%"></div>
                </div>
            `;
        }
        
        // Display accessibility icons
        const accessibilityIconsHtml = route.accessibilityTypes.map(type => {
            return `
                <div class="accessibility-icon" title="${ACCESSIBILITY_DESCRIPTIONS[type]}">
                    <i class="fas fa-${ACCESSIBILITY_ICONS[type]}"></i>
                    <span>${ACCESSIBILITY_DESCRIPTIONS[type]}</span>
                </div>
            `;
        }).join('');
        
        // Update steps list with accessibility notes
        if (elements.stepList) {
            let stepsHtml = '';
            
            // Add accessibility icons section
            stepsHtml += `
                <div class="accessibility-icons">
                    ${accessibilityIconsHtml}
                </div>
            `;
            
            // Add each step
            route.steps.forEach((step, index) => {
                stepsHtml += `
                    <li>
                        <span class="step-number">${index + 1}</span>
                        <span class="step-text">${step}</span>
                    </li>
                `;
            });
            
            // Add accessibility notes section
            if (route.accessibilityNotes) {
                stepsHtml += `
                    <li class="accessibility-notes">
                        <i class="fas fa-info-circle"></i>
                        <div class="note-content">
                            <h4>Accessibility Information</h4>
                            <p>${route.accessibilityNotes}</p>
                        </div>
                    </li>
                `;
            }
            
            elements.stepList.innerHTML = stepsHtml;
        }
        
        // Simulate map display
        simulateRouteDrawing();
    }

    // Simulate searching and finding routes
    function setupRouteSearch() {
        const searchForm = document.getElementById('route-search-form');
        
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const startPoint = document.getElementById('start').value;
                const destination = document.getElementById('destination').value;
                const accessibilityNeeds = document.getElementById('accessibility-needs').value;
                const transportMode = document.getElementById('transport-mode').value;
                
                if (!startPoint || !destination) {
                    showToast('Please enter both a starting point and destination');
                    return;
                }
                
                // Create loading overlay
                const loadingOverlay = createLoadingOverlay();
                document.body.appendChild(loadingOverlay);
                
                // Simulate route search (in a real app, this would call an API)
                setTimeout(() => {
                    // Remove loading overlay
                    document.body.removeChild(loadingOverlay);
                    
                    // Find a random route from our sample data
                    const randomRoute = sampleRoutes[Math.floor(Math.random() * sampleRoutes.length)];
                    
                    // Always ensure wheelchair accessibility regardless of selection
                    let selectedRoute = {...randomRoute};
                    selectedRoute.name = `${startPoint} to ${destination}`;
                    selectedRoute.description = `A wheelchair-accessible journey from ${startPoint} to ${destination}`;
                    
                    // Add user-selected accessibility needs
                    if (accessibilityNeeds && !selectedRoute.accessibilityTypes.includes(accessibilityNeeds)) {
                        selectedRoute.accessibilityTypes.push(accessibilityNeeds);
                    }
                    
                    // Ensure wheelchair accessibility is always included
                    if (!selectedRoute.accessibilityTypes.includes(ACCESSIBILITY_TYPES.WHEELCHAIR)) {
                        selectedRoute.accessibilityTypes.push(ACCESSIBILITY_TYPES.WHEELCHAIR);
                    }
                    
                    // Display the route
                    displayRouteDetails(selectedRoute);
                    
                    // Scroll to map
                    elements.mapWrapper.scrollIntoView({ behavior: 'smooth' });
                    
                    // Show success message
                    showToast('Wheelchair accessible route found!');
                }, 1500);
            });
        }
    }

    // Add CSS for toast notifications and accessibility features
    function addToastStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background-color: var(--primary-color);
                color: white;
                padding: 12px 24px;
                border-radius: 4px;
                z-index: 1000;
                opacity: 0;
                transition: transform 0.3s ease, opacity 0.3s ease;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .toast.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.8);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 5;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top-color: var(--primary-color);
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .accessibility-icons {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px dashed var(--border-color);
            }
            
            .accessibility-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                background-color: var(--background-light);
                border-radius: 50%;
                color: var(--primary-color);
            }
            
            .accessibility-notes {
                margin-top: 1rem !important;
                padding: 0.75rem !important;
                background-color: var(--background-light) !important;
                border-left: 3px solid var(--success-color) !important;
                border-radius: 0 8px 8px 0 !important;
                display: flex !important;
                align-items: flex-start !important;
                gap: 0.75rem !important;
            }
            
            .accessibility-notes i {
                color: var(--success-color);
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            
            .accessibility-rating {
                font-size: 0.8rem;
                color: var(--success-color);
                font-weight: normal;
            }
            
            body.dark-mode .loading-overlay {
                background-color: rgba(0, 0, 0, 0.7);
            }
            
            body.dark-mode .spinner {
                border-color: rgba(255, 255, 255, 0.1);
                border-top-color: var(--dark-primary);
            }
            
            body.dark-mode .toast {
                background-color: var(--dark-primary);
                color: var(--dark-background);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
            }
            
            body.dark-mode .accessibility-icon {
                background-color: rgba(255, 255, 255, 0.1);
                color: var(--dark-primary);
            }
            
            body.dark-mode .accessibility-notes {
                background-color: rgba(255, 255, 255, 0.05) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Create a loading overlay
    function createLoadingOverlay() {
        if (document.querySelector('.map-view') && !document.querySelector('.loading-overlay')) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.classList.add('loading-overlay');
            
            const spinner = document.createElement('div');
            spinner.classList.add('spinner');
            
            loadingOverlay.appendChild(spinner);
            document.querySelector('.map-view').appendChild(loadingOverlay);
        }
    }

    // Initialize all functionality
    function init() {
        setupRouteSearch();
        addToastStyles();
        
        // Add CSS for accessibility features
        addAccessibilityStyles();
    }
    
    // Add styles for accessibility features
    function addAccessibilityStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .accessibility-badge {
                display: inline-flex;
                align-items: center;
                background-color: var(--primary-color);
                color: white;
                padding: 6px 12px;
                border-radius: 50px;
                margin: 10px 0;
                font-weight: 500;
            }
            
            .accessibility-badge i {
                margin-right: 6px;
                font-size: 14px;
            }
            
            .accessibility-rating-bar {
                height: 6px;
                background-color: rgba(var(--primary-rgb), 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-top: 4px;
            }
            
            .accessibility-rating-fill {
                height: 100%;
                background-color: var(--primary-color);
                border-radius: 3px;
            }
            
            body.dark-mode .accessibility-rating-bar {
                background-color: rgba(var(--primary-rgb), 0.15);
            }
            
            body.dark-mode .accessibility-badge {
                background-color: var(--dark-primary);
            }
        `;
        document.head.appendChild(styleEl);
    }

    // Start the application
    init();
} 