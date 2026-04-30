(function () {
    const API_KEY = 'AIzaSyAXtbzVDS-7QGGeH3-tvZnc9XOST13TgBQ';
    const stationsDataFallback = {
        "Abbey Road": "Full",
        "Acton Central": "Full",
        "Acton Town": "Full",
        "Aldgate": "None",
        "Aldgate East": "Interchange",
        "All Saints": "Full",
        "Alperton": "None",
        "Amersham": "Partial",
        "Anerley": "Full",
        "Angel": "None",
        "Archway": "None",
        "Arnos Grove": "None",
        "Arsenal": "None",
        "Baker Street": "Interchange",
        "Balham": "None",
        "Bank": "Partial",
        "Barbican": "None",
        "Barking": "Full",
        "Barkingside": "Partial",
        "Barons Court": "Interchange",
        "Bayswater": "None",
        "Beckton": "Full",
        "Beckton Park": "Full",
        "Becontree": "None",
        "Belsize Park": "None",
        "Bermondsey": "Full",
        "Bethnal Green": "None",
        "Blackfriars": "Full",
        "Blackhorse Road": "None",
        "Blackwall": "Full",
        "Bond Street": "None",
        "Borough": "Full",
        "Boston Manor": "None",
        "Bounds Green": "None",
        "Bow Church": "Full",
        "Bow Road": "None",
        "Brent Cross": "None",
        "Brixton": "Full",
        "Brockley": "Partial",
        "Bromley-by-Bow": "None",
        "Brondesbury": "None",
        "Brondesbury Park": "None",
        "Buckhurst Hill": "None",
        "Burnt Oak": "None",
        "Bushey": "Full",
        "Caledonian Road": "Full",
        "Caledonian Road & Barnsbury": "Full",
        "Camden Road": "Interchange",
        "Camden Town": "Full",
        "Canada Water": "Full",
        "Canary Wharf": "Full",
        "Canning Town": "Interchange",
        "Cannon Street": "Full",
        "Canonbury": "Full",
        "Canons Park": "None",
        "Carpenders Park": "Full",
        "Chalfont & Latimer": "None",
        "Chalk Farm": "None",
        "Chancery Lane": "None",
        "Charing Cross": "Full",
        "Chesham": "None",
        "Chigwell": "None",
        "Chiswick Park": "Full",
        "Chorleywood": "None",
        "Clapham Common": "None",
        "Clapham High Street": "None",
        "Clapham Junction": "Full",
        "Clapham North": "None",
        "Clapham South": "None",
        "Cockfosters": "Full",
        "Colindale": "None",
        "Colliers Wood": "None",
        "Covent Garden": "Full",
        "Crossharbour": "None",
        "Crouch Hill": "None",
        "Croxley": "Full",
        "Crystal Palace": "Full",
        "Custom House for ExCeL": "Full",
        "Cutty Sark for Maritime Greenwich": "Full",
        "Cyprus": "None",
        "Dalston Junction": "Full",
        "Dagenham East": "Full",
        "Dagenham Heathway": "Full",
        "Dalston Kingsland": "None",
        "Debden": "None",
        "Denmark Hill": "None",
        "Deptford Bridge": "Full",
        "Devons Road": "Full",
        "Dollis Hill": "None",
        "Ealing Broadway": "Full",
        "Ealing Common": "Full",
        "Earl's Court": "Interchange",
        "East Acton": "None",
        "Eastcote": "None",
        "East Finchley": "None",
        "East Ham": "Full",
        "East India": "Full",
        "East Putney": "None",
        "Edgware": "Full",
        "Edgware Road": "Full",
        "Elephant & Castle": "Interchange",
        "Elm Park": "Full",
        "Elverson Road": "Full",
        "Emirates Greenwich Peninsula": "Full",
        "Emirates Royal Docks": "Full",
        "Embankment": "None",
        "Epping": "Full",
        "Euston": "Full",
        "Euston Square": "Interchange",
        "Fairlop": "None",
        "Farringdon": "None",
        "Finchley Central": "None",
        "Finchley Road": "Full",
        "Finchley Road & Frognal": "Full",
        "Finsbury Park": "Interchange",
        "Forest Hill": "None",
        "Fulham Broadway": "Full",
        "Gallions Reach": "Full",
        "Gants Hill": "None",
        "Gloucester Road": "Full",
        "Golders Green": "None",
        "Goldhawk Road": "None",
        "Goodge Street": "None",
        "Gospel Oak": "None",
        "Grange Hill": "None",
        "Great Portland Street": "Interchange",
        "Greenford": "None",
        "Greenwich": "None",
        "Green Park": "Full",
        "Gunnersbury": "None",
        "Hackney Central": "None",
        "Hackney Wick": "None",
        "Haggerston": "None",
        "Hainault": "Full",
        "Hammersmith": "None",
        "Hampstead": "None",
        "Hampstead Heath": "None",
        "Hanger Lane": "Full",
        "Harlesden": "None",
        "Harringay Green Lanes": "None",
        "Harrow & Wealdstone": "Interchange",
        "Harrow-on-the Hill": "None",
        "Hatch End": "None",
        "Hatton Cross": "Full",
        "Headstone Lane": "None",
        "Heathrow Terminals 1, 2, 3": "Full",
        "Heathrow Terminal 4": "Full",
        "Heathrow Terminal 5": "Full",
        "Hendon Central": "None",
        "Heron Quays": "None",
        "High Barnet": "None",
        "Highbury & Islington": "Interchange",
        "Highgate": "None",
        "High Street Kensington": "None",
        "Hillingdon": "Full",
        "Holborn": "None",
        "Holland Park": "None",
        "Holloway Road": "None",
        "Homerton": "None",
        "Honor Oak Park": "None",
        "Hornchurch": "Full",
        "Hounslow Central": "Full",
        "Hounslow East": "Full",
        "Hounslow West": "None",
        "Hoxton": "None",
        "Hyde Park Corner": "None",
        "Ickenham": "None",
        "Imperial Wharf": "Full",
        "Island Gardens": "None",
        "Kennington": "None",
        "Kensal Green": "None",
        "Kensal Rise": "None",
        "Kensington (Olympia)": "Interchange",
        "Kentish Town": "None",
        "Kentish Town West": "None",
        "Kenton": "None",
        "Kew Gardens": "Full",
        "Kilburn": "None",
        "Kilburn High Road": "None",
        "Kilburn Park": "None",
        "Kingsbury": "Full",
        "King’s Cross St. Pancras": "Interchange",
        "King George V": "None",
        "Knightsbridge": "None",
        "Ladbroke Grove": "None",
        "Lambeth North": "None",
        "Lancaster Gate": "None",
        "Langdon Park": "Full",
        "Latimer Road": "None",
        "Leicester Square": "None",
        "Lewisham": "Full",
        "Leyton": "None",
        "Leyton Midland Road": "None",
        "Leytonstone": "None",
        "Leytonstone High Road": "None",
        "Limehouse": "Full",
        "Liverpool Street": "None",
        "London Bridge": "Full",
        "London City Airport": "Full",
        "Loughton": "None",
        "Maida Vale": "None",
        "Manor House": "None",
        "Mansion House": "None",
        "Marble Arch": "None",
        "Marylebone": "Full",
        "Mile End": "None",
        "Mill Hill East": "None",
        "Monument": "Interchange",
        "Moorgate": "None",
        "Moor Park": "None",
        "Morden": "Full",
        "Mornington Crescent": "None",
        "Mudchute": "None",
        "Neasden": "None",
        "Newbury Park": "Full",
        "New Cross": "None",
        "New Cross Gate": "None",
        "North Acton": "None",
        "North Ealing": "None",
        "Northfields": "Full",
        "North Greenwich": "Full",
        "North Harrow": "None",
        "Northolt": "None",
        "North Wembley": "None",
        "Northwick Park": "None",
        "Northwood": "None",
        "Northwood Hills": "None",
        "Norwood Junction": "None",
        "Notting Hill Gate": "None",
        "Oakwood": "Full",
        "Old Street": "None",
        "Osterley": "None",
        "Oval": "None",
        "Oxford Circus": "Full",
        "Paddington": "Full",
        "Park Royal": "None",
        "Parsons Green": "None",
        "Peckham Rye": "None",
        "Penge West": "None",
        "Perivale": "None",
        "Piccadilly Circus": "None",
        "Pimlico": "None",
        "Pinner": "None",
        "Plaistow": "None",
        "Pontoon Dock": "None",
        "Poplar": "None",
        "Preston Road": "None",
        "Prince Regent": "None",
        "Pudding Mill Lane": "None",
        "Putney Bridge": "None",
        "Queensbury": "None",
        "Queen’s Park": "None",
        "Queens Road Peckham": "None",
        "Queensway": "None",
        "Ravenscourt Park": "None",
        "Rayners Lane": "None",
        "Redbridge": "None",
        "Regent’s Park": "None",
        "Richmond": "Full",
        "Rickmansworth": "None",
        "Roding Valley": "None",
        "Rotherhithe": "None",
        "Royal Albert": "None",
        "Royal Oak": "None",
        "Royal Victoria": "None",
        "Ruislip": "None",
        "Ruislip Gardens": "None",
        "Ruislip Manor": "None",
        "Russell Square": "None",
        "St. James’s Park": "None",
        "St. John’s Wood": "None",
        "St. Paul’s": "None",
        "Seven Sisters": "None",
        "Shadwell": "None",
        "Shepherd’s Bush (Central)": "None",
        "Shepherd’s Bush (Overground)": "None",
        "Shepherd’s Bush Market": "None",
        "Shoreditch High Street": "None",
        "Sloane Square": "None",
        "Snaresbrook": "None",
        "South Acton": "None",
        "South Ealing": "None",
        "Southfields": "None",
        "Southgate": "None",
        "South Hampstead": "None",
        "South Harrow": "None",
        "South Kensington": "None",
        "South Kenton": "None",
        "South Quay": "None",
        "South Ruislip": "None",
        "South Tottenham": "None",
        "Southwark": "None",
        "South Wimbledon": "None",
        "South Woodford": "None",
        "Stamford Brook": "None",
        "Stanmore": "None",
        "Star Lane": "None",
        "Stepney Green": "None",
        "Stockwell": "None",
        "Stonebridge Park": "None",
        "Stratford": "Full",
        "Stratford High Street": "None",
        "Stratford International": "None",
        "Sudbury Hill": "None",
        "Sudbury Town": "None",
        "Surrey Quays": "None",
        "Swiss Cottage": "None",
        "Sydenham": "None",
        "Temple": "None",
        "Theydon Bois": "None",
        "Tooting Bec": "None",
        "Tooting Broadway": "None",
        "Tottenham Court Road": "Full",
        "Tottenham Hale": "None",
        "Totteridge & Whetstone": "None",
        "Tower Gateway": "None",
        "Tower Hill": "None",
        "Tufnell Park": "None",
        "Turnham Green": "None",
        "Turnpike Lane": "None",
        "Upminster": "None",
        "Upminster Bridge": "None",
        "Upney": "None",
        "Upper Holloway": "None",
        "Upton Park": "None",
        "Uxbridge": "None",
        "Vauxhall": "None",
        "Victoria": "None",
        "Walthamstow Central": "None",
        "Walthamstow Queen’s Road": "None",
        "Wandsworth Road": "None",
        "Wanstead": "None",
        "Wanstead Park": "None",
        "Wapping": "None",
        "Warren Street": "None",
        "Warwick Avenue": "None",
        "Waterloo": "None",
        "Watford": "None",
        "Watford Junction": "None",
        "Watford High Street": "None",
        "Wembley Central": "None",
        "Wembley Park": "None",
        "West Acton": "None",
        "Westbourne Park": "None",
        "West Brompton": "None",
        "West Croydon": "None",
        "Westferry": "None",
        "West Finchley": "None",
        "West Ham": "None",
        "West Hampstead": "None",
        "West Harrow": "None",
        "West India Quay": "None",
        "West Kensington": "None",
        "Westminster": "None",
        "West Ruislip": "None",
        "West Silvertown": "None",
        "Whitechapel": "None",
        "White City": "None",
        "Willesden Green": "None",
        "Willesden Junction": "None",
        "Wimbledon": "None",
        "Wimbledon Park": "None",
        "Woodford": "None",
        "Woodgrange Park": "None",
        "Wood Green": "None",
        "Wood Lane": "None",
        "Woodside Park": "None",
        "Woolwich Arsenal": "Full"
    };

    const ErrorTypes = {
        MAPS_INITIALIZATION: 'MAPS_INITIALIZATION',
        DIRECTIONS_SERVICE: 'DIRECTIONS_SERVICE',
        STATION_DATA: 'STATION_DATA',
        NETWORK: 'NETWORK',
        VALIDATION: 'VALIDATION'
    };

    const ErrorMessages = {
        [ErrorTypes.MAPS_INITIALIZATION]: 'Failed to initialize Google Maps',
        [ErrorTypes.DIRECTIONS_SERVICE]: 'Failed to get directions',
        [ErrorTypes.STATION_DATA]: 'Failed to load station data',
        [ErrorTypes.NETWORK]: 'Network error occurred',
        [ErrorTypes.VALIDATION]: 'Invalid input'
    };

    const handleError = (error, type = ErrorTypes.NETWORK) => {
        const errorMessage = ErrorMessages[type] || 'An unexpected error occurred';
        console.error(errorMessage + ':', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.textContent = errorMessage + '. Please try again later.';
        const main = document.getElementById('main-content');
        if (main) {
            main.prepend(errorDiv);
            setTimeout(function () { errorDiv.remove(); }, 5000);
        }
    };

    const initializeDarkMode = () => {
        const darkModeToggle = document.getElementById("dark-mode-toggle");
        const sunIcon = document.getElementById("sun-icon");
        const moonIcon = document.getElementById("moon-icon");
        const header = document.querySelector('header');
        if (!darkModeToggle || !sunIcon || !moonIcon || !header) return;

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
            applyDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }

        darkModeToggle.addEventListener('change', () => {
            const isChecked = darkModeToggle.checked;
            applyDarkMode(isChecked);
            localStorage.setItem('darkMode', isChecked ? 'enabled' : 'disabled');
        });
    };

    class MapService {
        constructor() {
            this.mapElement = null;
        }
        async initialize(mapElement) {
            this.mapElement = mapElement;
        }
        planRoute(startStation, endStation) {
            if (!this.mapElement) return;
            const mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}`
                + `&origin=${encodeURIComponent(startStation + ' Station, London')}`
                + `&destination=${encodeURIComponent(endStation + ' Station, London')}`
                + `&mode=transit&zoom=12`;
            this.mapElement.src = mapUrl;
        }
        reset() {
            if (this.mapElement) this.mapElement.src = '';
        }
    }

    class StationService {
        constructor() {
            this.stationData = {};
            this.CACHE_KEY = 'tfl_station_data';
            this.CACHE_DURATION = 24 * 60 * 60 * 1000;
        }
        async fetchStationData() {
            const cachedData = this.getCachedData();
            if (cachedData) {
                this.stationData = cachedData;
                return cachedData;
            }
            this.stationData = stationsDataFallback;
            this.saveToCache(this.stationData);
            return this.stationData;
        }
        getCachedData() {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;
            try {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp > this.CACHE_DURATION) {
                    localStorage.removeItem(this.CACHE_KEY);
                    return null;
                }
                return parsed.data;
            } catch (error) {
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }
        }
        saveToCache(data) {
            localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        }
        populateDropdowns() {
            const startSelect = document.getElementById("start-station");
            const endSelect = document.getElementById("end-station");
            if (!startSelect || !endSelect || !this.stationData) return;

            startSelect.innerHTML = '';
            endSelect.innerHTML = '';
            this.addPlaceholderOption(startSelect, 'Select a start station');
            this.addPlaceholderOption(endSelect, 'Select an end station');

            Object.entries(this.stationData)
                .map(([name, accessibility]) => ({
                    name,
                    accessibility,
                    display: `${name} ${this.getAccessibilityIcon(accessibility)}`
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach((station) => {
                    this.addStationOption(startSelect, station);
                    this.addStationOption(endSelect, station);
                });
        }
        addPlaceholderOption(selectElement, text) {
            const option = document.createElement("option");
            option.value = '';
            option.text = text;
            option.disabled = true;
            option.selected = true;
            selectElement.add(option);
        }
        addStationOption(selectElement, station) {
            const option = document.createElement("option");
            option.value = station.name;
            option.text = station.display;
            option.dataset.accessibility = station.accessibility;
            selectElement.add(option);
        }
        getAccessibilityIcon(accessibility) {
            switch (accessibility) {
                case 'Full': return '♿';
                case 'Partial': return '⚡';
                case 'Interchange': return '↔️';
                case 'None': return '⚠️';
                default: return '';
            }
        }
        validateRouteSelection(start, end) {
            if (!start || !end) {
                handleError(new Error('Please select both start and end stations.'), ErrorTypes.VALIDATION);
                return false;
            }
            if (start === end) {
                handleError(new Error('Please select different stations for the start and end points.'), ErrorTypes.VALIDATION);
                return false;
            }
            return true;
        }
        reset() {
            const startSelect = document.getElementById("start-station");
            const endSelect = document.getElementById("end-station");
            if (startSelect) startSelect.selectedIndex = 0;
            if (endSelect) endSelect.selectedIndex = 0;
        }
    }

    const stationService = new StationService();
    const mapService = new MapService();
    const loadingSpinner = document.getElementById("loading-spinner");
    const startStationSelect = document.getElementById("start-station");
    const endStationSelect = document.getElementById("end-station");
    const mapContainer = document.getElementById("map-container");
    const overlay = document.getElementById("overlay");
    const backToTopButton = document.getElementById("back-to-top");
    const routeRecommendation = document.getElementById("route-recommendation");
    const routeMeta = document.getElementById("route-meta");
    const scenarioFired = document.getElementById("scenario-fired");
    const accessibilityGuidance = document.getElementById("accessibility-guidance");
    const stationBreakdownContainer = document.getElementById("station-breakdown");
    const liftStatusContainer = document.getElementById("lift-status");
    const liveDeparturesContainer = document.getElementById("live-departures");
    const assistancePanel = document.getElementById("assistance-panel");
    const mapPreviewControls = document.getElementById("map-preview-controls");
    const routeOptionsContainer = document.getElementById("route-options");
    const routeStepsContainer = document.getElementById("route-steps");
    const mapElement = document.getElementById("map");
    let listenersInitialized = false;
    let currentMapUrls = { full: '', via: '', final: '' };

    const displayAccessibilityInfo = (start, end) => {
        const startAccessibility = stationService.stationData[start] || 'N/A';
        const endAccessibility = stationService.stationData[end] || 'N/A';
        document.getElementById("start-accessibility").textContent = `Accessibility: ${startAccessibility}`;
        document.getElementById("end-accessibility").textContent = `Accessibility: ${endAccessibility}`;
        updateJourneyGuidance(start, end, startAccessibility, endAccessibility);
    };

    const updateJourneyGuidance = (start, end, startAccessibility, endAccessibility) => {
        const guidance = [];
        const lowerAccessibility = [startAccessibility, endAccessibility];
        const hasNoStepFree = lowerAccessibility.includes('None');
        const hasPartial = lowerAccessibility.includes('Partial');
        const hasInterchange = lowerAccessibility.includes('Interchange');

        if (startAccessibility === 'Full' && endAccessibility === 'Partial') {
            routeRecommendation.textContent = 'Start is fully step-free, but destination is partially step-free. Keep Tube for the core journey and prepare a final transfer fallback.';
            guidance.push(`Use Tube from ${start} first, then switch near ${end} if destination platform access is constrained.`);
            guidance.push(`Use an accessible bus or short walking transfer for the final approach to ${end} when needed.`);
        } else if (hasNoStepFree) {
            routeRecommendation.textContent = 'This journey includes at least one station with no step-free access. Consider a bus-first route for the inaccessible segment.';
            guidance.push(`Use bus links near ${start} or ${end} where lifts are unavailable.`);
            guidance.push('If travelling by Tube, plan extra time for staff-assisted routing and alternative entrances.');
        } else if (hasPartial) {
            routeRecommendation.textContent = 'This journey includes partial step-free access. Check platform-specific access before travelling.';
            guidance.push('Some platforms or exits may require stairs. Confirm your exact platform before departure.');
            guidance.push('If needed, switch to an accessible bus segment for the final leg.');
        } else if (hasInterchange) {
            routeRecommendation.textContent = 'This journey uses interchange-access stations. Transfers are typically easier than street-level access.';
            guidance.push('Interchange access supports platform-to-platform movement, but street-to-platform access may vary.');
        } else {
            routeRecommendation.textContent = 'This route is suitable for step-free travel from start to end.';
            guidance.push('Both selected stations are marked as fully step-free.');
        }

        guidance.push('Check live lift status before departure, as station conditions may change.');
        guidance.push('Ask station staff for boarding ramps when required.');
        renderGuidanceList(guidance);
    };

    const renderGuidanceList = (guidance) => {
        accessibilityGuidance.innerHTML = '';
        guidance.forEach((item) => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            accessibilityGuidance.appendChild(listItem);
        });
    };

    const renderRouteSteps = (steps = []) => {
        routeStepsContainer.innerHTML = '';
        const orderedList = document.createElement('ol');
        orderedList.className = 'route-step-list';
        steps.forEach((step) => {
            const item = document.createElement('li');
            item.textContent = step.text;
            orderedList.appendChild(item);
        });
        routeStepsContainer.appendChild(orderedList);
    };

    const applyMapPreview = (previewMode) => {
        if (previewMode === 'via' && currentMapUrls.via) {
            mapElement.src = currentMapUrls.via;
            return;
        }
        if (previewMode === 'final' && currentMapUrls.final) {
            mapElement.src = currentMapUrls.final;
        } else if (currentMapUrls.full) {
            mapElement.src = currentMapUrls.full;
        }
    };

    const renderMapPreviewControls = (option) => {
        mapPreviewControls.innerHTML = '';
        currentMapUrls = {
            full: option.mapUrl,
            via: option.waypointMapUrl || option.mapUrl,
            final: option.finalLegMapUrl || option.mapUrl
        };
        const createButton = (id, label) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'map-preview-button';
            button.dataset.preview = id;
            button.textContent = label;
            button.addEventListener('click', () => {
                mapPreviewControls.querySelectorAll('.map-preview-button').forEach((item) => item.classList.remove('active'));
                button.classList.add('active');
                applyMapPreview(id);
            });
            return button;
        };
        const fullButton = createButton('full', 'Full journey map');
        const viaButton = createButton('via', 'Via interchange map');
        const finalButton = createButton('final', 'Final leg map');
        fullButton.classList.add('active');
        mapPreviewControls.appendChild(fullButton);
        mapPreviewControls.appendChild(viaButton);
        mapPreviewControls.appendChild(finalButton);
    };

    const renderStationBreakdown = (start, end, startAccessibility, endAccessibility) => {
        const getGuaranteedConstraintDetails = (accessibility, stationName) => {
            switch (accessibility) {
                case 'Full':
                    return [
                        'Street-to-platform step-free route is expected during normal operation.',
                        `Tube-first routing is generally suitable at ${stationName}.`,
                        'Still confirm live lift status before travel.'
                    ];
                case 'Interchange':
                    return [
                        'Interchange movements can be step-free while some entrances/exits remain constrained.',
                        'Use signed step-free routes for platform changes.',
                        `Allow extra transfer time at ${stationName}.`
                    ];
                case 'Partial':
                    return [
                        'Only some platforms/exits are step-free; direction matters.',
                        'A platform change may introduce stairs if the wrong platform is used.',
                        `Keep a bus-link backup ready around ${stationName}.`
                    ];
                case 'None':
                    return [
                        'No full step-free street-to-platform route is expected.',
                        'Use a nearby accessible station and complete the last leg by bus or walking transfer.',
                        `Treat ${stationName} as a non-step-free endpoint when planning.`
                    ];
                default:
                    return [
                        'Accessibility classification unavailable.',
                        'Use conservative routing via an accessible interchange.',
                        `Confirm conditions at ${stationName} with station staff.`
                    ];
            }
        };

        const startDetails = getGuaranteedConstraintDetails(startAccessibility, start);
        const endDetails = getGuaranteedConstraintDetails(endAccessibility, end);
        stationBreakdownContainer.innerHTML = `
            <div class="station-breakdown-card">
                <h3>${start}</h3>
                <p>Step-free indicator: ${startAccessibility}</p>
                <ul>
                    ${startDetails.map((detail) => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
            <div class="station-breakdown-card">
                <h3>${end}</h3>
                <p>Step-free indicator: ${endAccessibility}</p>
                <ul>
                    ${endDetails.map((detail) => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
        `;
    };

    const renderLiveDepartures = () => {
        liveDeparturesContainer.textContent = 'Live departures are currently unavailable. Keep a timed fallback plan (next bus and alternate interchange) before travelling.';
    };

    const renderLiftStatus = (startAccessibility, endAccessibility) => {
        liftStatusContainer.innerHTML = '';
        [
            `Start lift status: ${startAccessibility === 'None' ? 'Likely unavailable' : 'Check on arrival'}`,
            `End lift status: ${endAccessibility === 'None' ? 'Likely unavailable' : 'Check on arrival'}`,
            'Interchange lift status: Check on arrival'
        ].forEach((text) => {
            const badge = document.createElement('span');
            badge.className = 'lift-badge';
            badge.textContent = text;
            liftStatusContainer.appendChild(badge);
        });
    };

    const renderAssistancePanel = (start, end, startAccessibility, endAccessibility) => {
        const likelyRampNeeded = startAccessibility !== 'Full' || endAccessibility !== 'Full';
        assistancePanel.innerHTML = `
            <h3>Assistance planning</h3>
            <p>${likelyRampNeeded ? 'Ramp and staff assistance may be required on this journey.' : 'Assistance is less likely, but can still be requested in advance.'}</p>
            <ul>
                <li>Request help from station staff at departure and interchange points.</li>
                <li>If travelling to National Rail destinations, plan Passenger Assist ahead of travel.</li>
                <li>Keep a bus-link fallback ready if lifts are unavailable at any step.</li>
            </ul>
            <p><a href="https://tfl.gov.uk/transport-accessibility/help-from-staff" target="_blank" rel="noopener noreferrer">TfL staff assistance information</a></p>
            <p><a href="https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/" target="_blank" rel="noopener noreferrer">National Rail Passenger Assist</a></p>
            <p><strong>Planned journey:</strong> ${start} to ${end}</p>
        `;
    };

    const createMapUrl = (origin, destination, mode, transitMode) => {
        let url = `https://www.google.com/maps/embed/v1/directions?key=${API_KEY}`
            + `&origin=${encodeURIComponent(origin)}`
            + `&destination=${encodeURIComponent(destination)}`
            + `&mode=${encodeURIComponent(mode)}&zoom=12`;
        return url;
    };

    const buildRouteOptions = (start, end, startAccessibility, endAccessibility) => {
        const startStation = `${start} Station, London`;
        const endStation = `${end} Station, London`;
        const startAccessibleHub = `step free station near ${start} Station, London`;
        const endAccessibleHub = `step free station near ${end} Station, London`;
        const hasInaccessibleLeg = [startAccessibility, endAccessibility].some((value) => value === 'None' || value === 'Partial');

        if (!hasInaccessibleLeg) {
            return [
                {
                    title: 'Recommended: Tube-focused route',
                    badge: 'Tube-first',
                    rationale: 'Prioritises Tube and rail services where possible.',
                    mapUrl: createMapUrl(startStation, endStation, 'transit', 'subway|rail'),
                    finalLegMapUrl: createMapUrl(`accessible interchange near ${end} Station, London`, endStation, 'transit'),
                    steps: [{ text: `Travel from ${start} to ${end} using Tube-first services.` }]
                },
                {
                    title: 'Alternative: Mixed public transport',
                    badge: 'Alternative',
                    rationale: 'Allows Tube, rail and bus combinations if faster.',
                    mapUrl: createMapUrl(startStation, endStation, 'transit'),
                    finalLegMapUrl: createMapUrl(`major interchange near ${end} Station, London`, endStation, 'transit'),
                    steps: [{ text: 'Use whichever public transport connection is step-free at each leg.' }]
                },
                {
                    title: 'Backup: Bus-friendly route',
                    badge: 'Backup',
                    rationale: 'Shows a route with bus options if rail access changes.',
                    mapUrl: createMapUrl(startStation, endStation, 'transit', 'bus'),
                    finalLegMapUrl: createMapUrl(`accessible interchange near ${end} Station, London`, endStation, 'transit'),
                    steps: [{ text: 'Switch to accessible bus routes if station lifts are disrupted.' }]
                }
            ];
        }

        if (startAccessibility === 'Full' && endAccessibility === 'Partial') {
            return [
                {
                    title: 'Recommended: Tube core then final transfer',
                    badge: 'Partial destination',
                    rationale: 'Stay on Tube for the main route, then use bus/walking for the final constrained section.',
                    mapUrl: createMapUrl(startStation, endStation, 'transit'),
                    finalLegMapUrl: createMapUrl(`accessible interchange near ${end} Station, London`, endStation, 'transit'),
                    steps: [
                        { text: `Travel by Tube from ${start} toward ${end}.` },
                        { text: `If destination platform/exit at ${end} is not step-free for your direction, get off at the nearest accessible interchange and complete by bus.` }
                    ]
                },
                {
                    title: 'Alternative: Early bus switch',
                    badge: 'Alternative',
                    rationale: 'Switch to bus before destination to avoid uncertain platform constraints.',
                    mapUrl: createMapUrl(startStation, endStation, 'transit'),
                    finalLegMapUrl: createMapUrl(`major interchange near ${end} Station, London`, endStation, 'transit'),
                    steps: [{ text: `Use Tube for the core section, then bus for the destination approach into ${end}.` }]
                }
            ];
        }

        return [
            {
                title: 'Recommended: Accessible hub transfer',
                badge: 'Bus-link required',
                rationale: 'Finds a nearby step-free station first, then continues by Tube/rail.',
                mapUrl: createMapUrl(startStation, endStation, 'transit'),
                finalLegMapUrl: createMapUrl(startAccessibleHub, endStation, 'transit'),
                steps: [
                    { text: `Start at ${start} and head towards an accessible interchange.` },
                    { text: `Use a bus link to complete access into ${end}.` }
                ]
            },
            {
                title: 'Leg 1: Bus to accessible station',
                badge: 'Step 1',
                rationale: `Use bus to reach a step-free station near ${start}.`,
                mapUrl: createMapUrl(startStation, startAccessibleHub, 'transit', 'bus'),
                finalLegMapUrl: createMapUrl(startStation, startAccessibleHub, 'transit'),
                steps: [{ text: `Take an accessible bus from ${start} to a nearby step-free hub.` }]
            },
            {
                title: 'Leg 2: Tube-focused core journey',
                badge: 'Step 2',
                rationale: 'Travel between accessible hubs using Tube and rail services.',
                mapUrl: createMapUrl(startAccessibleHub, endAccessibleHub, 'transit', 'subway|rail'),
                finalLegMapUrl: createMapUrl(startAccessibleHub, endAccessibleHub, 'transit'),
                steps: [{ text: 'Use Tube and rail between the two accessible hubs.' }]
            },
            {
                title: 'Leg 3: Final local connection',
                badge: 'Step 3',
                rationale: `Finish with bus or walking links near ${end}.`,
                mapUrl: createMapUrl(endAccessibleHub, endStation, 'walking'),
                finalLegMapUrl: createMapUrl(endAccessibleHub, endStation, 'walking'),
                steps: [{ text: `Complete the final leg into ${end} by accessible local connection.` }]
            }
        ];
    };

    const renderRouteOptions = (routeOptions) => {
        routeOptionsContainer.innerHTML = '';
        routeOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'route-option-button';
            if (index === 0) {
                button.classList.add('active');
            }
            button.innerHTML = `<strong>${option.title}</strong><span>${option.badge} - ${option.rationale}</span>`;
            button.addEventListener('click', () => {
                Array.from(routeOptionsContainer.querySelectorAll('.route-option-button')).forEach((item) => {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                renderMapPreviewControls(option);
                applyMapPreview('full');
                mapContainer.style.display = "block";
                renderRouteSteps(option.steps || [{ text: option.rationale }]);
                routeMeta.textContent = `${routeMeta.textContent.split(' | ')[0]} | Selected option: ${option.title}`;
            });
            routeOptionsContainer.appendChild(button);
        });
    };

    const hideOverlay = () => overlay.classList.add("hidden");

    const resetSelections = () => {
        if (startStationSelect) startStationSelect.selectedIndex = 0;
        if (endStationSelect) endStationSelect.selectedIndex = 0;
        document.getElementById("start-accessibility").textContent = '';
        document.getElementById("end-accessibility").textContent = '';
        scenarioFired.textContent = '';
        routeRecommendation.textContent = 'Select a route to see step-free guidance, interchange notes, and alternatives.';
        routeMeta.textContent = '';
        accessibilityGuidance.innerHTML = '';
        stationBreakdownContainer.innerHTML = '';
        liftStatusContainer.innerHTML = '';
        liveDeparturesContainer.innerHTML = '';
        assistancePanel.innerHTML = '';
        routeOptionsContainer.innerHTML = '';
        routeStepsContainer.innerHTML = '';
        mapPreviewControls.innerHTML = '';
        mapContainer.style.display = "none";
        overlay.classList.remove("hidden");
        mapService.reset();
        stationService.reset();
    };

    const planRoute = async () => {
        const start = startStationSelect.value;
        const end = endStationSelect.value;
        if (!stationService.validateRouteSelection(start, end)) return;
        const startAccessibility = stationService.stationData[start] || 'N/A';
        const endAccessibility = stationService.stationData[end] || 'N/A';
        displayAccessibilityInfo(start, end);
        try {
            const routeOptions = buildRouteOptions(start, end, startAccessibility, endAccessibility);
            scenarioFired.textContent = `Scenario fired: ${startAccessibility}->${endAccessibility}`;
            routeMeta.textContent = `Fallback confidence | Scenario: ${startAccessibility}->${endAccessibility} | Selected option: ${routeOptions[0].title}`;
            const strictPolicyGuidance = [];
            if (['None', 'Partial'].includes(startAccessibility)) {
                strictPolicyGuidance.push(`Origin reroute required: start at an accessible hub near ${start} before entering the Tube network.`);
            }
            if (['None', 'Partial', 'Interchange'].includes(endAccessibility)) {
                strictPolicyGuidance.push(`Destination transfer required: leave rail near ${end} and complete the final leg by bus/walking transfer.`);
            }
            if (strictPolicyGuidance.length > 0) {
                renderGuidanceList([...Array.from(accessibilityGuidance.querySelectorAll('li')).map((item) => item.textContent), ...strictPolicyGuidance]);
            }
            renderRouteOptions(routeOptions);
            renderStationBreakdown(start, end, startAccessibility, endAccessibility);
            renderLiftStatus(startAccessibility, endAccessibility);
            renderLiveDepartures();
            renderAssistancePanel(start, end, startAccessibility, endAccessibility);
            renderMapPreviewControls(routeOptions[0]);
            applyMapPreview('full');
            renderRouteSteps(routeOptions[0].steps || [{ text: routeOptions[0].rationale }]);
            mapContainer.style.display = "block";
            overlay.classList.add("hidden");
        } catch (error) {
            handleError(error, ErrorTypes.MAPS_INITIALIZATION);
        }
    };

    const setupEventListeners = () => {
        if (listenersInitialized) return;
        document.getElementById("plan-route").addEventListener("click", planRoute);
        overlay.addEventListener("click", hideOverlay);
        document.getElementById("reset-button").addEventListener("click", resetSelections);
        listenersInitialized = true;
    };

    const initializeBackToTop = () => {
        if (!backToTopButton) return;
        window.onscroll = function () {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
                backToTopButton.style.display = "block";
            } else {
                backToTopButton.style.display = "none";
            }
        };
        backToTopButton.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    };

    const fetchTFL = async () => {
        setupEventListeners();
        loadingSpinner.style.display = "block";
        try {
            await stationService.fetchStationData();
            stationService.populateDropdowns();
            await mapService.initialize(document.getElementById("map"));
        } catch (error) {
            alert(`Failed to load station data. Error: ${error.message}`);
        } finally {
            loadingSpinner.style.display = "none";
        }
    };

    const startApp = async () => {
        initializeDarkMode();
        initializeBackToTop();
        await fetchTFL();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApp);
    } else {
        startApp();
    }
}());
