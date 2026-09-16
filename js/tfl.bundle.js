(() => {
  // js/utils/errorHandler.js
  var ErrorTypes = {
    MAPS_INITIALIZATION: "MAPS_INITIALIZATION",
    DIRECTIONS_SERVICE: "DIRECTIONS_SERVICE",
    STATION_DATA: "STATION_DATA",
    NETWORK: "NETWORK",
    VALIDATION: "VALIDATION"
  };
  var ErrorMessages = {
    [ErrorTypes.MAPS_INITIALIZATION]: "Failed to initialize Google Maps",
    [ErrorTypes.DIRECTIONS_SERVICE]: "Failed to get directions",
    [ErrorTypes.STATION_DATA]: "Failed to load station data",
    [ErrorTypes.NETWORK]: "Network error occurred",
    [ErrorTypes.VALIDATION]: "Invalid input"
  };
  var handleError = (error, type = ErrorTypes.NETWORK) => {
    const errorMessage = ErrorMessages[type] || "An unexpected error occurred";
    console.error(`${errorMessage}:`, error);
    if (type === ErrorTypes.VALIDATION && error?.message) {
      showErrorMessage(error.message);
      return;
    }
    showErrorMessage(error?.message ? `${errorMessage}: ${error.message}` : `${errorMessage}. Please try again.`);
  };
  var showErrorMessage = (message) => {
    clearErrorMessages();
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.setAttribute("role", "alert");
    errorDiv.textContent = message;
    document.getElementById("main-content").prepend(errorDiv);
    setTimeout(() => {
      errorDiv.remove();
    }, 5e3);
  };
  var clearErrorMessages = () => {
    const existingErrors = document.querySelectorAll(".error-message");
    existingErrors.forEach((error) => error.remove());
  };

  // js/utils/domUtils.js
  var elements = {
    loadingSpinner: document.getElementById("loading-spinner"),
    startStationSelect: document.getElementById("start-station"),
    endStationSelect: document.getElementById("end-station"),
    mapContainer: document.getElementById("map-container"),
    overlay: document.getElementById("overlay"),
    startAccessibility: document.getElementById("start-accessibility"),
    endAccessibility: document.getElementById("end-accessibility"),
    map: document.getElementById("map")
  };

  // js/data/stationsData.js
  var stationsDataFallback = {
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
    "King\u2019s Cross St. Pancras": "Interchange",
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
    "Queen\u2019s Park": "None",
    "Queens Road Peckham": "None",
    "Queensway": "None",
    "Ravenscourt Park": "None",
    "Rayners Lane": "None",
    "Redbridge": "None",
    "Regent\u2019s Park": "None",
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
    "St. James\u2019s Park": "None",
    "St. John\u2019s Wood": "None",
    "St. Paul\u2019s": "None",
    "Seven Sisters": "None",
    "Shadwell": "None",
    "Shepherd\u2019s Bush (Central)": "None",
    "Shepherd\u2019s Bush (Overground)": "None",
    "Shepherd\u2019s Bush Market": "None",
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
    "Walthamstow Queen\u2019s Road": "None",
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

  // js/modules/stations.js
  var StationService = class {
    constructor() {
      this.stationData = {};
      this.CACHE_KEY = "tfl_station_data_v2";
      this.CACHE_DURATION = 6 * 60 * 60 * 1e3;
      this.DATA_FINGERPRINT = Object.keys(stationsDataFallback).length;
    }
    async fetchStationData() {
      try {
        const cachedData = this.getCachedData();
        if (cachedData) {
          this.stationData = cachedData;
          return cachedData;
        }
        const data = await this.fetchFromKnownPathsOrFallback();
        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
          throw new Error("Station data is empty or invalid.");
        }
        this.stationData = data;
        this.saveToCache(data);
        return data;
      } catch (error) {
        throw new Error(`Failed to fetch station data: ${error.message}`);
      }
    }
    async fetchFromKnownPathsOrFallback() {
      const paths = [
        "./data/stations.json",
        "data/stations.json"
      ];
      let lastError = null;
      for (const path of paths) {
        try {
          const response = await fetch(path);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data && typeof data === "object" && Object.keys(data).length > 0) {
            return data;
          }
        } catch (error) {
          lastError = error;
        }
      }
      if (stationsDataFallback && typeof stationsDataFallback === "object" && Object.keys(stationsDataFallback).length > 0) {
        return stationsDataFallback;
      }
      throw lastError || new Error("Unable to load station data from known paths or fallback.");
    }
    getCachedData() {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) {
        localStorage.removeItem("tfl_station_data");
        return null;
      }
      try {
        const { data, timestamp, fingerprint } = JSON.parse(cached);
        if (fingerprint !== this.DATA_FINGERPRINT || Date.now() - timestamp > this.CACHE_DURATION) {
          localStorage.removeItem(this.CACHE_KEY);
          return null;
        }
        return data;
      } catch (error) {
        localStorage.removeItem(this.CACHE_KEY);
        return null;
      }
    }
    saveToCache(data) {
      const cacheData = {
        data,
        timestamp: Date.now(),
        fingerprint: this.DATA_FINGERPRINT
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    }
    isAccessible(accessibility) {
      return ["Full", "Partial", "Interchange"].includes(accessibility);
    }
    populateDropdowns() {
      if (!this.stationData || Object.keys(this.stationData).length === 0) {
        return;
      }
      elements.startStationSelect.innerHTML = "";
      elements.endStationSelect.innerHTML = "";
      this.addPlaceholderOption(elements.startStationSelect, "Select a start station");
      this.addPlaceholderOption(elements.endStationSelect, "Select an end station");
      const allStations = Object.entries(this.stationData).map(([station, accessibility]) => {
        const display = `${station} ${this.getAccessibilityIcon(accessibility)}`;
        return {
          name: station,
          display,
          accessibility
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
      allStations.forEach((station) => {
        this.addStationOption(elements.startStationSelect, station);
        this.addStationOption(elements.endStationSelect, station);
      });
    }
    addPlaceholderOption(selectElement, text) {
      const option = document.createElement("option");
      option.value = "";
      option.text = text;
      option.disabled = true;
      option.selected = true;
      selectElement.add(option);
    }
    getAccessibilityIcon(accessibility) {
      switch (accessibility) {
        case "Full":
          return "\u267F";
        case "Partial":
          return "\u26A1";
        case "Interchange":
          return "\u2194\uFE0F";
        case "None":
          return "\u26A0\uFE0F";
        default:
          return "";
      }
    }
    addStationOption(selectElement, station) {
      const option = document.createElement("option");
      option.value = station.name;
      option.text = station.display;
      option.dataset.accessibility = station.accessibility;
      selectElement.add(option);
    }
    validateRouteSelection(start, end) {
      try {
        if (!start || !end) {
          throw new Error("Please select both start and end stations.");
        }
        if (start === end) {
          throw new Error("Please select different stations for the start and end points.");
        }
        return true;
      } catch (error) {
        handleError(error, ErrorTypes.VALIDATION);
        return false;
      }
    }
    getStationAccessibility(station) {
      return this.stationData[station] || "N/A";
    }
    displayAccessibilityInfo(start, end) {
      const startAccessibility = this.getStationAccessibility(start);
      const endAccessibility = this.getStationAccessibility(end);
      elements.startAccessibility.textContent = `Accessibility: ${startAccessibility}`;
      elements.endAccessibility.textContent = `Accessibility: ${endAccessibility}`;
    }
    reset() {
      elements.startStationSelect.selectedIndex = 0;
      elements.endStationSelect.selectedIndex = 0;
    }
  };

  // js/config.js
  var runtime = typeof globalThis !== "undefined" ? globalThis : {};
  var API_KEY = runtime.FREEFLOW_GOOGLE_MAPS_API_KEY || "";
  var TFL_APP_KEY = runtime.FREEFLOW_TFL_APP_KEY || "";

  // js/data/stationCoords.js
  var stationCoords = {
    "Abbey Road": {
      "lat": 51.531926,
      "lon": 3737e-6
    },
    "Acton Central": {
      "lat": 51.508716,
      "lon": -0.262971
    },
    "Acton Town": {
      "lat": 51.503057,
      "lon": -0.280462
    },
    "Aldgate": {
      "lat": 51.514246,
      "lon": -0.075689
    },
    "Aldgate East": {
      "lat": 51.515037,
      "lon": -0.072384
    },
    "All Saints": {
      "lat": 51.511,
      "lon": -0.013135
    },
    "Alperton": {
      "lat": 51.540627,
      "lon": -0.29961
    },
    "Amersham": {
      "lat": 51.674126,
      "lon": -0.607714
    },
    "Anerley": {
      "lat": 51.412153,
      "lon": -0.065886
    },
    "Angel": {
      "lat": 51.532624,
      "lon": -0.105898
    },
    "Archway": {
      "lat": 51.565478,
      "lon": -0.134819
    },
    "Arnos Grove": {
      "lat": 51.616446,
      "lon": -0.133062
    },
    "Arsenal": {
      "lat": 51.558655,
      "lon": -0.107457
    },
    "Baker Street": {
      "lat": 51.522883,
      "lon": -0.15713
    },
    "Balham": {
      "lat": 51.443288,
      "lon": -0.152997
    },
    "Bank": {
      "lat": 51.51225,
      "lon": -0.087792
    },
    "Barbican": {
      "lat": 51.520275,
      "lon": -0.097993
    },
    "Barking": {
      "lat": 51.539413,
      "lon": 0.080988
    },
    "Barkingside": {
      "lat": 51.585689,
      "lon": 0.088585
    },
    "Barons Court": {
      "lat": 51.490311,
      "lon": -0.213427
    },
    "Bayswater": {
      "lat": 51.512284,
      "lon": -0.187938
    },
    "Beckton": {
      "lat": 51.514362,
      "lon": 0.061453
    },
    "Beckton Park": {
      "lat": 51.508793,
      "lon": 0.054932
    },
    "Becontree": {
      "lat": 51.540331,
      "lon": 0.127016
    },
    "Belsize Park": {
      "lat": 51.550529,
      "lon": -0.164783
    },
    "Bermondsey": {
      "lat": 51.49775,
      "lon": -0.063993
    },
    "Bethnal Green": {
      "lat": 51.527222,
      "lon": -0.055506
    },
    "Blackfriars": {
      "lat": 51.509613,
      "lon": -0.104166
    },
    "Blackhorse Road": {
      "lat": 51.586919,
      "lon": -0.04115
    },
    "Blackwall": {
      "lat": 51.507991,
      "lon": -6969e-6
    },
    "Bond Street": {
      "lat": 51.514304,
      "lon": -0.149723
    },
    "Borough": {
      "lat": 51.501199,
      "lon": -0.09337
    },
    "Boston Manor": {
      "lat": 51.495635,
      "lon": -0.324939
    },
    "Bounds Green": {
      "lat": 51.607034,
      "lon": -0.124235
    },
    "Bow Church": {
      "lat": 51.527858,
      "lon": -0.020936
    },
    "Bow Road": {
      "lat": 51.52694,
      "lon": -0.025128
    },
    "Brent Cross": {
      "lat": 51.57665,
      "lon": -0.213622
    },
    "Brixton": {
      "lat": 51.462961,
      "lon": -0.114531
    },
    "Brockley": {
      "lat": 51.464649,
      "lon": -0.037537
    },
    "Bromley-by-Bow": {
      "lat": 51.524839,
      "lon": -0.011538
    },
    "Brondesbury": {
      "lat": 51.545166,
      "lon": -0.202309
    },
    "Brondesbury Park": {
      "lat": 51.540734,
      "lon": -0.210054
    },
    "Buckhurst Hill": {
      "lat": 51.626605,
      "lon": 0.046757
    },
    "Burnt Oak": {
      "lat": 51.602774,
      "lon": -0.264048
    },
    "Bushey": {
      "lat": 51.645582,
      "lon": -0.384752
    },
    "Caledonian Road": {
      "lat": 51.548519,
      "lon": -0.118493
    },
    "Caledonian Road & Barnsbury": {
      "lat": 51.543041,
      "lon": -0.116729
    },
    "Camden Road": {
      "lat": 51.541791,
      "lon": -0.138701
    },
    "Camden Town": {
      "lat": 51.539292,
      "lon": -0.14274
    },
    "Canada Water": {
      "lat": 51.498053,
      "lon": -0.049667
    },
    "Canary Wharf": {
      "lat": 51.503734,
      "lon": -0.019121
    },
    "Canning Town": {
      "lat": 51.513584,
      "lon": 8322e-6
    },
    "Cannon Street": {
      "lat": 51.511451,
      "lon": -0.090357
    },
    "Canonbury": {
      "lat": 51.548732,
      "lon": -0.092191
    },
    "Canons Park": {
      "lat": 51.607701,
      "lon": -0.294693
    },
    "Carpenders Park": {
      "lat": 51.628351,
      "lon": -0.385939
    },
    "Chalfont & Latimer": {
      "lat": 51.667985,
      "lon": -0.560689
    },
    "Chalk Farm": {
      "lat": 51.544118,
      "lon": -0.153388
    },
    "Chancery Lane": {
      "lat": 51.518247,
      "lon": -0.111583
    },
    "Charing Cross": {
      "lat": 51.507819,
      "lon": -0.126137
    },
    "Chesham": {
      "lat": 51.705208,
      "lon": -0.611247
    },
    "Chigwell": {
      "lat": 51.617916,
      "lon": 0.075041
    },
    "Chiswick Park": {
      "lat": 51.494627,
      "lon": -0.267972
    },
    "Chorleywood": {
      "lat": 51.654358,
      "lon": -0.518461
    },
    "Clapham Common": {
      "lat": 51.461742,
      "lon": -0.138317
    },
    "Clapham High Street": {
      "lat": 51.465481,
      "lon": -0.132522
    },
    "Clapham Junction": {
      "lat": 51.463724,
      "lon": -0.168997
    },
    "Clapham North": {
      "lat": 51.465135,
      "lon": -0.130016
    },
    "Clapham South": {
      "lat": 51.452654,
      "lon": -0.147582
    },
    "Cockfosters": {
      "lat": 51.65152,
      "lon": -0.149171
    },
    "Colindale": {
      "lat": 51.595424,
      "lon": -0.249919
    },
    "Colliers Wood": {
      "lat": 51.41816,
      "lon": -0.178086
    },
    "Covent Garden": {
      "lat": 51.513093,
      "lon": -0.124436
    },
    "Crossharbour": {
      "lat": 51.495728,
      "lon": -0.014606
    },
    "Crouch Hill": {
      "lat": 51.571302,
      "lon": -0.117149
    },
    "Croxley": {
      "lat": 51.647044,
      "lon": -0.441718
    },
    "Crystal Palace": {
      "lat": 51.418111,
      "lon": -0.072605
    },
    "Custom House for ExCeL": {
      "lat": 51.509716,
      "lon": 0.026699
    },
    "Cutty Sark for Maritime Greenwich": {
      "lat": 51.481682,
      "lon": -0.010677
    },
    "Cyprus": {
      "lat": 51.508473,
      "lon": 0.063925
    },
    "Dagenham East": {
      "lat": 51.544096,
      "lon": 0.166017
    },
    "Dagenham Heathway": {
      "lat": 51.541639,
      "lon": 0.147527
    },
    "Dalston Junction": {
      "lat": 51.546116,
      "lon": -0.075137
    },
    "Dalston Kingsland": {
      "lat": 51.548148,
      "lon": -0.075701
    },
    "Debden": {
      "lat": 51.645386,
      "lon": 0.083782
    },
    "Denmark Hill": {
      "lat": 51.468203,
      "lon": -0.089361
    },
    "Deptford Bridge": {
      "lat": 51.474215,
      "lon": -0.022438
    },
    "Devons Road": {
      "lat": 51.522667,
      "lon": -0.017615
    },
    "Dollis Hill": {
      "lat": 51.551955,
      "lon": -0.239068
    },
    "Ealing Broadway": {
      "lat": 51.514993,
      "lon": -0.302131
    },
    "Ealing Common": {
      "lat": 51.51014,
      "lon": -0.288265
    },
    "Earl's Court": {
      "lat": 51.492063,
      "lon": -0.193378
    },
    "East Acton": {
      "lat": 51.516612,
      "lon": -0.247248
    },
    "East Finchley": {
      "lat": 51.587131,
      "lon": -0.165012
    },
    "East Ham": {
      "lat": 51.538948,
      "lon": 0.051186
    },
    "East India": {
      "lat": 51.509359,
      "lon": -2326e-6
    },
    "East Putney": {
      "lat": 51.459205,
      "lon": -0.211
    },
    "Eastcote": {
      "lat": 51.576506,
      "lon": -0.397373
    },
    "Edgware": {
      "lat": 51.613653,
      "lon": -0.274928
    },
    "Edgware Road": {
      "lat": 51.520299,
      "lon": -0.17015
    },
    "Elephant & Castle": {
      "lat": 51.494536,
      "lon": -0.100606
    },
    "Elm Park": {
      "lat": 51.549775,
      "lon": 0.19864
    },
    "Elverson Road": {
      "lat": 51.469074,
      "lon": -0.016728
    },
    "Embankment": {
      "lat": 51.507058,
      "lon": -0.122666
    },
    "Emirates Greenwich Peninsula": {
      "lat": 51.499782,
      "lon": 8324e-6
    },
    "Emirates Royal Docks": {
      "lat": 51.507736,
      "lon": 0.017891
    },
    "Epping": {
      "lat": 51.69368,
      "lon": 0.113767
    },
    "Euston": {
      "lat": 51.527365,
      "lon": -0.132754
    },
    "Euston Square": {
      "lat": 51.525604,
      "lon": -0.135829
    },
    "Fairlop": {
      "lat": 51.595618,
      "lon": 0.091004
    },
    "Farringdon": {
      "lat": 51.520252,
      "lon": -0.104913
    },
    "Finchley Central": {
      "lat": 51.600921,
      "lon": -0.192527
    },
    "Finchley Road": {
      "lat": 51.546825,
      "lon": -0.179845
    },
    "Finchley Road & Frognal": {
      "lat": 51.550266,
      "lon": -0.183141
    },
    "Finsbury Park": {
      "lat": 51.564158,
      "lon": -0.106825
    },
    "Forest Hill": {
      "lat": 51.43928,
      "lon": -0.053157
    },
    "Fulham Broadway": {
      "lat": 51.480081,
      "lon": -0.195422
    },
    "Gallions Reach": {
      "lat": 51.508941,
      "lon": 0.071555
    },
    "Gants Hill": {
      "lat": 51.576544,
      "lon": 0.066185
    },
    "Gloucester Road": {
      "lat": 51.494316,
      "lon": -0.182658
    },
    "Golders Green": {
      "lat": 51.572259,
      "lon": -0.194039
    },
    "Goldhawk Road": {
      "lat": 51.502005,
      "lon": -0.226715
    },
    "Goodge Street": {
      "lat": 51.520599,
      "lon": -0.134361
    },
    "Gospel Oak": {
      "lat": 51.555335,
      "lon": -0.15077
    },
    "Grange Hill": {
      "lat": 51.613378,
      "lon": 0.092066
    },
    "Great Portland Street": {
      "lat": 51.52384,
      "lon": -0.144262
    },
    "Green Park": {
      "lat": 51.506947,
      "lon": -0.142787
    },
    "Greenford": {
      "lat": 51.542424,
      "lon": -0.34605
    },
    "Greenwich": {
      "lat": 51.478087,
      "lon": -0.013673
    },
    "Gunnersbury": {
      "lat": 51.491803,
      "lon": -0.275267
    },
    "Hackney Central": {
      "lat": 51.547105,
      "lon": -0.056058
    },
    "Hackney Wick": {
      "lat": 51.54341,
      "lon": -0.02492
    },
    "Haggerston": {
      "lat": 51.538705,
      "lon": -0.075666
    },
    "Hainault": {
      "lat": 51.603659,
      "lon": 0.093482
    },
    "Hammersmith": {
      "lat": 51.492304,
      "lon": -0.223619
    },
    "Hampstead": {
      "lat": 51.556239,
      "lon": -0.177464
    },
    "Hampstead Heath": {
      "lat": 51.55521,
      "lon": -0.165705
    },
    "Hanger Lane": {
      "lat": 51.530177,
      "lon": -0.292704
    },
    "Harlesden": {
      "lat": 51.53631,
      "lon": -0.257883
    },
    "Harringay Green Lanes": {
      "lat": 51.577182,
      "lon": -0.098144
    },
    "Harrow & Wealdstone": {
      "lat": 51.592268,
      "lon": -0.335217
    },
    "Harrow-on-the Hill": {
      "lat": 51.579195,
      "lon": -0.337225
    },
    "Hatch End": {
      "lat": 51.609417,
      "lon": -0.368601
    },
    "Hatton Cross": {
      "lat": 51.466747,
      "lon": -0.423191
    },
    "Headstone Lane": {
      "lat": 51.602649,
      "lon": -0.35722
    },
    "Heathrow Terminal 4": {
      "lat": 51.458524,
      "lon": -0.445771
    },
    "Heathrow Terminal 5": {
      "lat": 51.470053,
      "lon": -0.490589
    },
    "Heathrow Terminals 1, 2, 3": {
      "lat": 51.471189,
      "lon": -0.452437
    },
    "Hendon Central": {
      "lat": 51.583301,
      "lon": -0.226424
    },
    "Heron Quays": {
      "lat": 51.503379,
      "lon": -0.021421
    },
    "High Barnet": {
      "lat": 51.650541,
      "lon": -0.194298
    },
    "High Street Kensington": {
      "lat": 51.501055,
      "lon": -0.192792
    },
    "Highbury & Islington": {
      "lat": 51.54635,
      "lon": -0.103324
    },
    "Highgate": {
      "lat": 51.577532,
      "lon": -0.145857
    },
    "Hillingdon": {
      "lat": 51.553715,
      "lon": -0.449828
    },
    "Holborn": {
      "lat": 51.51758,
      "lon": -0.120475
    },
    "Holland Park": {
      "lat": 51.507143,
      "lon": -0.205679
    },
    "Holloway Road": {
      "lat": 51.552697,
      "lon": -0.113244
    },
    "Homerton": {
      "lat": 51.547012,
      "lon": -0.04236
    },
    "Honor Oak Park": {
      "lat": 51.449989,
      "lon": -0.045505
    },
    "Hornchurch": {
      "lat": 51.554093,
      "lon": 0.219116
    },
    "Hounslow Central": {
      "lat": 51.471295,
      "lon": -0.366578
    },
    "Hounslow East": {
      "lat": 51.473213,
      "lon": -0.356474
    },
    "Hounslow West": {
      "lat": 51.473469,
      "lon": -0.386544
    },
    "Hoxton": {
      "lat": 51.531512,
      "lon": -0.075681
    },
    "Hyde Park Corner": {
      "lat": 51.503035,
      "lon": -0.152441
    },
    "Ickenham": {
      "lat": 51.561992,
      "lon": -0.442001
    },
    "Imperial Wharf": {
      "lat": 51.47555,
      "lon": -0.183084
    },
    "Island Gardens": {
      "lat": 51.487811,
      "lon": -0.010139
    },
    "Kennington": {
      "lat": 51.488337,
      "lon": -0.105963
    },
    "Kensal Green": {
      "lat": 51.530539,
      "lon": -0.225016
    },
    "Kensal Rise": {
      "lat": 51.534554,
      "lon": -0.219957
    },
    "Kensington (Olympia)": {
      "lat": 51.497624,
      "lon": -0.210015
    },
    "Kentish Town": {
      "lat": 51.550312,
      "lon": -0.140733
    },
    "Kentish Town West": {
      "lat": 51.546548,
      "lon": -0.146655
    },
    "Kenton": {
      "lat": 51.581756,
      "lon": -0.31691
    },
    "Kew Gardens": {
      "lat": 51.477069,
      "lon": -0.285148
    },
    "Kilburn": {
      "lat": 51.547183,
      "lon": -0.204248
    },
    "Kilburn High Road": {
      "lat": 51.537277,
      "lon": -0.192237
    },
    "Kilburn Park": {
      "lat": 51.534979,
      "lon": -0.194232
    },
    "King George V": {
      "lat": 51.502003,
      "lon": 0.062624
    },
    "King\u2019s Cross St. Pancras": {
      "lat": 51.530663,
      "lon": -0.123194
    },
    "Kingsbury": {
      "lat": 51.584845,
      "lon": -0.27879
    },
    "Knightsbridge": {
      "lat": 51.501669,
      "lon": -0.160508
    },
    "Ladbroke Grove": {
      "lat": 51.517449,
      "lon": -0.210391
    },
    "Lambeth North": {
      "lat": 51.498808,
      "lon": -0.112315
    },
    "Lancaster Gate": {
      "lat": 51.511723,
      "lon": -0.175494
    },
    "Langdon Park": {
      "lat": 51.515172,
      "lon": -0.01415
    },
    "Latimer Road": {
      "lat": 51.513389,
      "lon": -0.217799
    },
    "Leicester Square": {
      "lat": 51.511386,
      "lon": -0.128426
    },
    "Lewisham": {
      "lat": 51.465081,
      "lon": -0.013016
    },
    "Leyton": {
      "lat": 51.556589,
      "lon": -5523e-6
    },
    "Leyton Midland Road": {
      "lat": 51.569725,
      "lon": -8051e-6
    },
    "Leytonstone": {
      "lat": 51.568324,
      "lon": 8194e-6
    },
    "Leytonstone High Road": {
      "lat": 51.563554,
      "lon": 8416e-6
    },
    "Limehouse": {
      "lat": 51.512469,
      "lon": -0.039799
    },
    "Liverpool Street": {
      "lat": 51.517372,
      "lon": -0.083182
    },
    "London Bridge": {
      "lat": 51.505881,
      "lon": -0.086807
    },
    "London City Airport": {
      "lat": 51.503419,
      "lon": 0.048749
    },
    "Loughton": {
      "lat": 51.641443,
      "lon": 0.055476
    },
    "Maida Vale": {
      "lat": 51.529777,
      "lon": -0.185758
    },
    "Manor House": {
      "lat": 51.570738,
      "lon": -0.096118
    },
    "Mansion House": {
      "lat": 51.512117,
      "lon": -0.094009
    },
    "Marble Arch": {
      "lat": 51.513424,
      "lon": -0.158953
    },
    "Marylebone": {
      "lat": 51.521602,
      "lon": -0.163013
    },
    "Mile End": {
      "lat": 51.525122,
      "lon": -0.03364
    },
    "Mill Hill East": {
      "lat": 51.608229,
      "lon": -0.209986
    },
    "Monument": {
      "lat": 51.5107,
      "lon": -0.085969
    },
    "Moor Park": {
      "lat": 51.629845,
      "lon": -0.432454
    },
    "Moorgate": {
      "lat": 51.518176,
      "lon": -0.088322
    },
    "Morden": {
      "lat": 51.402142,
      "lon": -0.194839
    },
    "Mornington Crescent": {
      "lat": 51.534679,
      "lon": -0.138789
    },
    "Mudchute": {
      "lat": 51.490704,
      "lon": -0.014738
    },
    "Neasden": {
      "lat": 51.553986,
      "lon": -0.249837
    },
    "New Cross": {
      "lat": 51.476344,
      "lon": -0.032426
    },
    "New Cross Gate": {
      "lat": 51.475128,
      "lon": -0.040399
    },
    "Newbury Park": {
      "lat": 51.575726,
      "lon": 0.090004
    },
    "North Acton": {
      "lat": 51.523524,
      "lon": -0.259755
    },
    "North Ealing": {
      "lat": 51.517505,
      "lon": -0.288868
    },
    "North Greenwich": {
      "lat": 51.500474,
      "lon": 4295e-6
    },
    "North Harrow": {
      "lat": 51.584872,
      "lon": -0.362408
    },
    "North Wembley": {
      "lat": 51.562551,
      "lon": -0.304
    },
    "Northfields": {
      "lat": 51.499319,
      "lon": -0.314719
    },
    "Northolt": {
      "lat": 51.548236,
      "lon": -0.368699
    },
    "Northwick Park": {
      "lat": 51.578481,
      "lon": -0.318056
    },
    "Northwood": {
      "lat": 51.611053,
      "lon": -0.423829
    },
    "Northwood Hills": {
      "lat": 51.600572,
      "lon": -0.409464
    },
    "Norwood Junction": {
      "lat": 51.397019,
      "lon": -0.075221
    },
    "Notting Hill Gate": {
      "lat": 51.509128,
      "lon": -0.196104
    },
    "Oakwood": {
      "lat": 51.647726,
      "lon": -0.132182
    },
    "Old Street": {
      "lat": 51.525864,
      "lon": -0.08777
    },
    "Osterley": {
      "lat": 51.481274,
      "lon": -0.352224
    },
    "Oval": {
      "lat": 51.48185,
      "lon": -0.112439
    },
    "Oxford Circus": {
      "lat": 51.515224,
      "lon": -0.141903
    },
    "Paddington": {
      "lat": 51.516981,
      "lon": -0.17616
    },
    "Park Royal": {
      "lat": 51.527123,
      "lon": -0.284341
    },
    "Parsons Green": {
      "lat": 51.475277,
      "lon": -0.20117
    },
    "Peckham Rye": {
      "lat": 51.470034,
      "lon": -0.069414
    },
    "Penge West": {
      "lat": 51.417555,
      "lon": -0.06084
    },
    "Perivale": {
      "lat": 51.536717,
      "lon": -0.323446
    },
    "Piccadilly Circus": {
      "lat": 51.51005,
      "lon": -0.133798
    },
    "Pimlico": {
      "lat": 51.489097,
      "lon": -0.133761
    },
    "Pinner": {
      "lat": 51.592901,
      "lon": -0.381161
    },
    "Plaistow": {
      "lat": 51.531341,
      "lon": 0.017451
    },
    "Pontoon Dock": {
      "lat": 51.502212,
      "lon": 0.032115
    },
    "Poplar": {
      "lat": 51.507744,
      "lon": -0.017384
    },
    "Preston Road": {
      "lat": 51.571972,
      "lon": -0.295107
    },
    "Prince Regent": {
      "lat": 51.509263,
      "lon": 0.034158
    },
    "Pudding Mill Lane": {
      "lat": 51.534302,
      "lon": -0.012755
    },
    "Putney Bridge": {
      "lat": 51.468262,
      "lon": -0.208731
    },
    "Queen\u2019s Park": {
      "lat": 51.534158,
      "lon": -0.204574
    },
    "Queens Road Peckham": {
      "lat": 51.473566,
      "lon": -0.057313
    },
    "Queensbury": {
      "lat": 51.594188,
      "lon": -0.286219
    },
    "Queensway": {
      "lat": 51.510312,
      "lon": -0.187152
    },
    "Ravenscourt Park": {
      "lat": 51.494122,
      "lon": -0.235881
    },
    "Rayners Lane": {
      "lat": 51.575147,
      "lon": -0.371127
    },
    "Redbridge": {
      "lat": 51.576243,
      "lon": 0.04536
    },
    "Regent\u2019s Park": {
      "lat": 51.523344,
      "lon": -0.146444
    },
    "Richmond": {
      "lat": 51.463152,
      "lon": -0.301448
    },
    "Rickmansworth": {
      "lat": 51.640207,
      "lon": -0.473703
    },
    "Roding Valley": {
      "lat": 51.617199,
      "lon": 0.043647
    },
    "Rotherhithe": {
      "lat": 51.500817,
      "lon": -0.052048
    },
    "Royal Albert": {
      "lat": 51.508357,
      "lon": 0.045935
    },
    "Royal Oak": {
      "lat": 51.519113,
      "lon": -0.188748
    },
    "Royal Victoria": {
      "lat": 51.509336,
      "lon": 0.018497
    },
    "Ruislip": {
      "lat": 51.571354,
      "lon": -0.421898
    },
    "Ruislip Gardens": {
      "lat": 51.560736,
      "lon": -0.41071
    },
    "Ruislip Manor": {
      "lat": 51.573202,
      "lon": -0.412973
    },
    "Russell Square": {
      "lat": 51.523073,
      "lon": -0.124285
    },
    "Seven Sisters": {
      "lat": 51.58333,
      "lon": -0.072584
    },
    "Shadwell": {
      "lat": 51.511693,
      "lon": -0.056643
    },
    "Shepherd\u2019s Bush (Central)": {
      "lat": 51.504376,
      "lon": -0.218813
    },
    "Shepherd\u2019s Bush (Overground)": {
      "lat": 51.504791,
      "lon": -0.219213
    },
    "Shepherd\u2019s Bush Market": {
      "lat": 51.505579,
      "lon": -0.226375
    },
    "Shoreditch High Street": {
      "lat": 51.523375,
      "lon": -0.075246
    },
    "Sloane Square": {
      "lat": 51.49227,
      "lon": -0.156377
    },
    "Snaresbrook": {
      "lat": 51.580678,
      "lon": 0.02144
    },
    "South Acton": {
      "lat": 51.499695,
      "lon": -0.270157
    },
    "South Ealing": {
      "lat": 51.501003,
      "lon": -0.307424
    },
    "South Hampstead": {
      "lat": 51.541432,
      "lon": -0.178878
    },
    "South Harrow": {
      "lat": 51.564888,
      "lon": -0.352492
    },
    "South Kensington": {
      "lat": 51.494094,
      "lon": -0.174138
    },
    "South Kenton": {
      "lat": 51.570232,
      "lon": -0.308433
    },
    "South Quay": {
      "lat": 51.50005,
      "lon": -0.015975
    },
    "South Ruislip": {
      "lat": 51.556853,
      "lon": -0.398915
    },
    "South Tottenham": {
      "lat": 51.580372,
      "lon": -0.072103
    },
    "South Wimbledon": {
      "lat": 51.415309,
      "lon": -0.192005
    },
    "South Woodford": {
      "lat": 51.591907,
      "lon": 0.027338
    },
    "Southfields": {
      "lat": 51.445073,
      "lon": -0.206602
    },
    "Southgate": {
      "lat": 51.632315,
      "lon": -0.127816
    },
    "Southwark": {
      "lat": 51.50427,
      "lon": -0.105331
    },
    "St. James\u2019s Park": {
      "lat": 51.499544,
      "lon": -0.133608
    },
    "St. John\u2019s Wood": {
      "lat": 51.534521,
      "lon": -0.173948
    },
    "St. Paul\u2019s": {
      "lat": 51.514936,
      "lon": -0.097567
    },
    "Stamford Brook": {
      "lat": 51.494917,
      "lon": -0.245704
    },
    "Stanmore": {
      "lat": 51.619839,
      "lon": -0.303266
    },
    "Star Lane": {
      "lat": 51.520786,
      "lon": 4156e-6
    },
    "Stepney Green": {
      "lat": 51.521858,
      "lon": -0.046596
    },
    "Stockwell": {
      "lat": 51.472184,
      "lon": -0.122644
    },
    "Stonebridge Park": {
      "lat": 51.543959,
      "lon": -0.275892
    },
    "Stratford": {
      "lat": 51.541508,
      "lon": -241e-5
    },
    "Stratford High Street": {
      "lat": 51.538196,
      "lon": -1078e-6
    },
    "Stratford International": {
      "lat": 51.545265,
      "lon": -9638e-6
    },
    "Sudbury Hill": {
      "lat": 51.556946,
      "lon": -0.336435
    },
    "Sudbury Town": {
      "lat": 51.550815,
      "lon": -0.315745
    },
    "Surrey Quays": {
      "lat": 51.493196,
      "lon": -0.047519
    },
    "Swiss Cottage": {
      "lat": 51.543681,
      "lon": -0.174894
    },
    "Sydenham": {
      "lat": 51.427248,
      "lon": -0.054244
    },
    "Temple": {
      "lat": 51.511006,
      "lon": -0.11426
    },
    "Theydon Bois": {
      "lat": 51.671759,
      "lon": 0.103085
    },
    "Tooting Bec": {
      "lat": 51.435678,
      "lon": -0.159736
    },
    "Tooting Broadway": {
      "lat": 51.42763,
      "lon": -0.168374
    },
    "Tottenham Court Road": {
      "lat": 51.516018,
      "lon": -0.130888
    },
    "Tottenham Hale": {
      "lat": 51.588108,
      "lon": -0.060241
    },
    "Totteridge & Whetstone": {
      "lat": 51.630597,
      "lon": -0.17921
    },
    "Tower Gateway": {
      "lat": 51.510617,
      "lon": -0.074818
    },
    "Tower Hill": {
      "lat": 51.509971,
      "lon": -0.076546
    },
    "Tufnell Park": {
      "lat": 51.556822,
      "lon": -0.138433
    },
    "Turnham Green": {
      "lat": 51.495148,
      "lon": -0.254555
    },
    "Turnpike Lane": {
      "lat": 51.590272,
      "lon": -0.102953
    },
    "Upminster": {
      "lat": 51.559063,
      "lon": 0.250882
    },
    "Upminster Bridge": {
      "lat": 51.55856,
      "lon": 0.235809
    },
    "Upney": {
      "lat": 51.538372,
      "lon": 0.10153
    },
    "Upper Holloway": {
      "lat": 51.563631,
      "lon": -0.129513
    },
    "Upton Park": {
      "lat": 51.53534,
      "lon": 0.035263
    },
    "Uxbridge": {
      "lat": 51.546565,
      "lon": -0.477949
    },
    "Vauxhall": {
      "lat": 51.485743,
      "lon": -0.124204
    },
    "Victoria": {
      "lat": 51.496359,
      "lon": -0.143102
    },
    "Walthamstow Central": {
      "lat": 51.582965,
      "lon": -0.019885
    },
    "Walthamstow Queen\u2019s Road": {
      "lat": 51.581503,
      "lon": -0.023846
    },
    "Wandsworth Road": {
      "lat": 51.470216,
      "lon": -0.13852
    },
    "Wanstead": {
      "lat": 51.575501,
      "lon": 0.028527
    },
    "Wanstead Park": {
      "lat": 51.551693,
      "lon": 0.026213
    },
    "Wapping": {
      "lat": 51.504388,
      "lon": -0.055931
    },
    "Warren Street": {
      "lat": 51.524951,
      "lon": -0.138321
    },
    "Warwick Avenue": {
      "lat": 51.523263,
      "lon": -0.183783
    },
    "Waterloo": {
      "lat": 51.503299,
      "lon": -0.11478
    },
    "Watford": {
      "lat": 51.657446,
      "lon": -0.417377
    },
    "Watford High Street": {
      "lat": 51.652655,
      "lon": -0.391711
    },
    "Watford Junction": {
      "lat": 51.663908,
      "lon": -0.395925
    },
    "Wembley Central": {
      "lat": 51.552304,
      "lon": -0.296852
    },
    "Wembley Park": {
      "lat": 51.563198,
      "lon": -0.279262
    },
    "West Acton": {
      "lat": 51.518001,
      "lon": -0.28098
    },
    "West Brompton": {
      "lat": 51.487268,
      "lon": -0.195599
    },
    "West Croydon": {
      "lat": 51.378428,
      "lon": -0.102585
    },
    "West Finchley": {
      "lat": 51.609426,
      "lon": -0.188362
    },
    "West Ham": {
      "lat": 51.528136,
      "lon": 5055e-6
    },
    "West Hampstead": {
      "lat": 51.546638,
      "lon": -0.191059
    },
    "West Harrow": {
      "lat": 51.57971,
      "lon": -0.3534
    },
    "West India Quay": {
      "lat": 51.50703,
      "lon": -0.020311
    },
    "West Kensington": {
      "lat": 51.490459,
      "lon": -0.206636
    },
    "West Ruislip": {
      "lat": 51.569688,
      "lon": -0.437886
    },
    "West Silvertown": {
      "lat": 51.502838,
      "lon": 0.02246
    },
    "Westbourne Park": {
      "lat": 51.52111,
      "lon": -0.201065
    },
    "Westferry": {
      "lat": 51.509431,
      "lon": -0.02675
    },
    "Westminster": {
      "lat": 51.50132,
      "lon": -0.124861
    },
    "White City": {
      "lat": 51.511959,
      "lon": -0.224297
    },
    "Whitechapel": {
      "lat": 51.519518,
      "lon": -0.059971
    },
    "Willesden Green": {
      "lat": 51.549146,
      "lon": -0.221537
    },
    "Willesden Junction": {
      "lat": 51.532259,
      "lon": -0.244283
    },
    "Wimbledon": {
      "lat": 51.421207,
      "lon": -0.206573
    },
    "Wimbledon Park": {
      "lat": 51.434573,
      "lon": -0.199719
    },
    "Wood Green": {
      "lat": 51.597479,
      "lon": -0.109886
    },
    "Wood Lane": {
      "lat": 51.509669,
      "lon": -0.22453
    },
    "Woodford": {
      "lat": 51.606899,
      "lon": 0.03397
    },
    "Woodgrange Park": {
      "lat": 51.549264,
      "lon": 0.044423
    },
    "Woodside Park": {
      "lat": 51.618014,
      "lon": -0.18542
    },
    "Woolwich Arsenal": {
      "lat": 51.489962,
      "lon": 0.06917
    }
  };

  // js/modules/routeMap.js
  var LONDON = [51.5074, -0.1278];
  var normaliseStation = (value = "") => String(value).replace(/,\s*London$/i, "").replace(/\s+Station$/i, "").replace(/^accessible station near\s+/i, "").trim();
  var lookupStationLatLon = (stationName = "") => {
    const key = normaliseStation(stationName);
    if (!key) return null;
    if (stationCoords[key]) return stationCoords[key];
    const match = Object.keys(stationCoords).find((name) => name.toLowerCase() === key.toLowerCase());
    return match ? stationCoords[match] : null;
  };
  var modeColour = (mode = "transit") => {
    if (mode === "walking") return "#0f766e";
    if (mode === "bus" || mode === "transit") return "#0369a1";
    return "#0b1f3a";
  };
  var RouteMap = class {
    constructor(element) {
      this.element = element;
      this.map = null;
      this.layer = null;
      this.ready = false;
    }
    ensure() {
      if (this.ready || !this.element || typeof window === "undefined" || !window.L) {
        return this.ready;
      }
      this.map = window.L.map(this.element, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false
      }).setView(LONDON, 11);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(this.map);
      this.layer = window.L.layerGroup().addTo(this.map);
      this.ready = true;
      setTimeout(() => this.map.invalidateSize(), 40);
      return true;
    }
    clear() {
      if (this.layer) this.layer.clearLayers();
    }
    reset() {
      this.clear();
      if (this.map) this.map.setView(LONDON, 11);
    }
    showStage({ from = "", to = "", mode = "transit", label = "" } = {}) {
      if (!this.ensure()) return false;
      this.clear();
      this.map.invalidateSize();
      const origin = lookupStationLatLon(from);
      const destination = lookupStationLatLon(to);
      const points = [];
      const addMarker = (point, title, tone) => {
        if (!point) return;
        const colour = tone === "start" ? "#0f766e" : tone === "end" ? "#b45309" : "#0369a1";
        const marker = window.L.circleMarker([point.lat, point.lon], {
          radius: 9,
          color: "#fff",
          weight: 2,
          fillColor: colour,
          fillOpacity: 1
        }).bindPopup(`<strong>${title}</strong>`);
        this.layer.addLayer(marker);
        points.push([point.lat, point.lon]);
      };
      addMarker(origin, normaliseStation(from) || "Start", "start");
      addMarker(destination, normaliseStation(to) || "End", "end");
      const drawLine = (latLngs, dashed = false) => {
        if (!latLngs?.length) return;
        const line = window.L.polyline(latLngs, {
          color: modeColour(mode),
          weight: 5,
          opacity: 0.85,
          dashArray: dashed || mode === "walking" ? "6 8" : null
        });
        if (label) line.bindPopup(label);
        this.layer.addLayer(line);
      };
      if (origin && destination) {
        drawLine([[origin.lat, origin.lon], [destination.lat, destination.lon]], true);
        const profile = mode === "walking" ? "foot" : "driving";
        const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson`;
        const requestId = `${from}|${to}|${mode}|${Date.now()}`;
        this._activeRequest = requestId;
        fetch(url).then((response) => response.ok ? response.json() : null).then((payload) => {
          if (this._activeRequest !== requestId || !this.layer) return;
          const coords = payload?.routes?.[0]?.geometry?.coordinates;
          if (!Array.isArray(coords) || !coords.length) return;
          this.clear();
          addMarker(origin, normaliseStation(from) || "Start", "start");
          addMarker(destination, normaliseStation(to) || "End", "end");
          const latLngs = coords.map(([lon, lat]) => [lat, lon]);
          drawLine(latLngs, mode === "walking");
          this.map.fitBounds(latLngs, { padding: [36, 36], maxZoom: 15 });
        }).catch(() => {
        });
      }
      if (points.length >= 2) {
        this.map.fitBounds(points, { padding: [36, 36], maxZoom: 15 });
      } else if (points.length === 1) {
        this.map.setView(points[0], 14);
      } else {
        this.map.setView(LONDON, 11);
        return false;
      }
      return Boolean(origin && destination);
    }
  };

  // js/modules/map.js
  var buildExternalMapsUrl = (origin, destination, mode = "transit") => {
    const travelmode = mode === "walking" ? "walking" : mode === "driving" ? "driving" : "transit";
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${travelmode}`;
  };
  var MapService = class {
    constructor() {
      this.API_KEY = API_KEY;
      this.mapElement = null;
      this.routeMap = null;
      this.externalLink = null;
    }
    async initialize(mapElement2, externalLink = null) {
      this.mapElement = mapElement2;
      this.externalLink = externalLink;
      if (mapElement2) {
        this.routeMap = new RouteMap(mapElement2);
      }
    }
    showStage(stage2 = {}) {
      if (!this.routeMap) return;
      const from = stage2.from || stage2.origin || "";
      const to = stage2.to || stage2.destination || "";
      const ok = this.routeMap.showStage({
        from,
        to,
        mode: stage2.mode || "transit",
        label: stage2.label || ""
      });
      if (this.externalLink) {
        const originLabel = `${String(from).replace(/ Station, London$/i, "")} Station, London`;
        const destLabel = `${String(to).replace(/ Station, London$/i, "")} Station, London`;
        this.externalLink.href = buildExternalMapsUrl(originLabel, destLabel, stage2.mode || "transit");
        this.externalLink.hidden = !(lookupStationLatLon(from) && lookupStationLatLon(to));
      }
      return ok;
    }
    planRoute(startStation, endStation) {
      this.showStage({
        from: startStation,
        to: endStation,
        mode: "transit",
        label: `${startStation} \u2192 ${endStation}`
      });
    }
    reset() {
      if (this.routeMap) this.routeMap.reset();
      if (this.externalLink) {
        this.externalLink.hidden = true;
        this.externalLink.removeAttribute("href");
      }
    }
  };

  // js/modules/darkMode.js
  var initializeDarkMode = () => {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const sunIcon = document.getElementById("sun-icon");
    const moonIcon = document.getElementById("moon-icon");
    const header = document.querySelector("header");
    if (!darkModeToggle || !sunIcon || !moonIcon || !header) {
      return;
    }
    const applyDarkMode = (isDarkMode) => {
      if (isDarkMode) {
        document.body.classList.add("dark-mode");
        header.classList.add("dark-mode");
        moonIcon.style.display = "none";
        sunIcon.style.display = "inline";
        darkModeToggle.checked = true;
      } else {
        document.body.classList.remove("dark-mode");
        header.classList.remove("dark-mode");
        moonIcon.style.display = "inline";
        sunIcon.style.display = "none";
        darkModeToggle.checked = false;
      }
    };
    const darkModePreference = localStorage.getItem("darkMode");
    if (darkModePreference === "enabled") {
      applyDarkMode(true);
    } else if (darkModePreference === "disabled") {
      applyDarkMode(false);
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyDarkMode(systemPrefersDark);
    }
    darkModeToggle.addEventListener("change", () => {
      const isChecked = darkModeToggle.checked;
      applyDarkMode(isChecked);
      localStorage.setItem("darkMode", isChecked ? "enabled" : "disabled");
    });
  };

  // js/modules/tflApi.js
  var API_BASE = "https://api.tfl.gov.uk";
  var REQUEST_TIMEOUT_MS = 1e4;
  var RAIL_MODES = /* @__PURE__ */ new Set(["tube", "dlr", "overground", "elizabeth-line", "national-rail"]);
  var stopPointCache = /* @__PURE__ */ new Map();
  var buildUrl = (path, params = {}) => {
    const url = new URL(path.startsWith("http") ? path : `${API_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value === void 0 || value === null || value === "") return;
      url.searchParams.set(key, value);
    });
    if (TFL_APP_KEY) url.searchParams.set("app_key", TFL_APP_KEY);
    return url.toString();
  };
  var tflFetch = async (path, params = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(buildUrl(path, params), { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`TfL API ${response.status} for ${path}`);
      }
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  };
  var normaliseStationKey = (name = "") => String(name).toLowerCase().replace(/['’]/g, "").replace(/\bstation\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  var stationNameMatches = (candidate, station) => {
    const left = normaliseStationKey(candidate);
    const right = normaliseStationKey(station);
    if (!left || !right) return false;
    if (left === right) return true;
    if (left.startsWith(`${right} `) || right.startsWith(`${left} `)) return true;
    return false;
  };
  var pickBestStopMatch = (matches = []) => {
    if (!Array.isArray(matches) || matches.length === 0) return null;
    const scored = matches.map((match) => {
      const modes = match.modes || [];
      const railScore = modes.some((mode) => RAIL_MODES.has(mode)) ? 2 : 0;
      const tubeScore = modes.includes("tube") ? 1 : 0;
      return { match, score: railScore + tubeScore };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].match;
  };
  var resolveArrivalsStopId = async (stop) => {
    if (!stop?.id) return null;
    if (!String(stop.id).startsWith("HUB")) return stop.id;
    const detail = await tflFetch(`/StopPoint/${encodeURIComponent(stop.id)}`);
    const children = detail.children || [];
    const railChild = children.find((child) => (child.modes || []).some((mode) => RAIL_MODES.has(mode) && mode !== "national-rail")) || children.find((child) => (child.modes || []).some((mode) => RAIL_MODES.has(mode)));
    return railChild?.id || stop.id;
  };
  var fetchLiftDisruptions = async () => {
    const data = await tflFetch("/Disruptions/Lifts");
    return Array.isArray(data) ? data : [];
  };
  var findLiftDisruptionsForStation = (disruptions = [], stationName) => {
    return disruptions.filter((item) => {
      const haystacks = [item.stopPointName, item.message, item.naptanCode, item.icsCode];
      return haystacks.some((value) => stationNameMatches(value, stationName));
    });
  };
  var searchStopPoint = async (query) => {
    const cacheKey = normaliseStationKey(query);
    if (stopPointCache.has(cacheKey)) return stopPointCache.get(cacheKey);
    const data = await tflFetch(`/StopPoint/Search/${encodeURIComponent(query)}`, {
      modes: "tube,dlr,overground,elizabeth-line,national-rail"
    });
    const best = pickBestStopMatch(data.matches || []);
    if (!best) {
      stopPointCache.set(cacheKey, null);
      return null;
    }
    const resolved = {
      id: best.id,
      icsId: best.icsId,
      name: best.name,
      modes: best.modes || [],
      lat: best.lat,
      lon: best.lon
    };
    stopPointCache.set(cacheKey, resolved);
    return resolved;
  };
  var fetchNearestFullHub = async (stationName, stationData = {}) => {
    const origin = await searchStopPoint(stationName);
    const originLat = Number.isFinite(origin?.lat) ? origin.lat : null;
    const originLon = Number.isFinite(origin?.lon) ? origin.lon : null;
    if (originLat == null || originLon == null) return null;
    const toRad = (deg) => deg * Math.PI / 180;
    const distanceMetres = (lat1, lon1, lat2, lon2) => {
      const earth = 6371e3;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return 2 * earth * Math.asin(Math.sqrt(a));
    };
    let best = null;
    let bestDistance = Infinity;
    Object.entries(stationData).forEach(([name, accessibility]) => {
      if (accessibility !== "Full" || name === stationName) return;
      const point = stationCoords[name];
      if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lon)) return;
      const distance = distanceMetres(originLat, originLon, point.lat, point.lon);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = name;
      }
    });
    return best;
  };
  var fetchArrivals = async (stopId, limit = 5) => {
    if (!stopId) return [];
    const data = await tflFetch(`/StopPoint/${encodeURIComponent(stopId)}/Arrivals`);
    if (!Array.isArray(data)) return [];
    return data.slice().sort((a, b) => (a.timeToStation || 0) - (b.timeToStation || 0)).slice(0, limit).map((prediction) => ({
      line: prediction.lineName || prediction.modeName || "Service",
      destination: prediction.destinationName || prediction.towards || "Unknown destination",
      dueInMins: Math.max(0, Math.round((prediction.timeToStation || 0) / 60))
    }));
  };
  var fetchArrivalsForStation = async (stationName) => {
    const stop = await searchStopPoint(stationName);
    if (!stop) return [];
    const arrivalsId = await resolveArrivalsStopId(stop);
    return fetchArrivals(arrivalsId);
  };
  var mapLegType = (modeId = "") => {
    const mode = String(modeId).toLowerCase();
    if (mode === "walking" || mode === "walk") return "walk";
    if (mode === "bus" || mode === "coach") return "bus";
    return "tube";
  };
  var journeyToStrategy = (journey, index, apiKey, start, end) => {
    const legs = journey.legs || [];
    const steps = legs.map((leg) => {
      const modeId = leg.mode?.id || leg.mode?.name || "";
      const summary = leg.instruction?.summary || `Travel by ${modeId || "transit"}`;
      return {
        type: mapLegType(modeId),
        text: summary,
        durationMins: leg.duration || null,
        modeName: leg.mode?.name || modeId || ""
      };
    });
    const duration = journey.duration || 0;
    const interchangeCount = Math.max(0, legs.filter((leg) => {
      const modeId = String(leg.mode?.id || "").toLowerCase();
      return modeId && modeId !== "walking" && modeId !== "walk";
    }).length - 1);
    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const createMapUrl2 = (origin, destination, mode = "transit") => {
      if (apiKey) {
        return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}&zoom=12`;
      }
      return `https://maps.google.com/maps?output=embed&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&dirflg=r`;
    };
    const id = index === 0 ? "tfl-step-free" : `tfl-step-free-alt-${index}`;
    return {
      id,
      title: index === 0 ? "TfL step-free journey" : `TfL step-free alternative ${index}`,
      badge: index === 0 ? "Live TfL" : "TfL alt",
      rationale: `Official step-free plan (${duration} mins, ${interchangeCount} interchange${interchangeCount === 1 ? "" : "s"}).`,
      mapUrl: createMapUrl2(startStation, endStation, "transit"),
      waypointMapUrl: createMapUrl2(startStation, endStation, "transit"),
      finalLegMapUrl: createMapUrl2(startStation, endStation, "transit"),
      steps: steps.length ? steps : [{ type: "tube", text: `Travel step-free from ${start} to ${end}.` }],
      durationMins: duration,
      interchangeCount,
      tflLive: true
    };
  };
  var fetchStepFreeJourneyStrategies = async ({ fromStation, toStation, apiKey = "" }) => {
    const [fromStop, toStop] = await Promise.all([
      searchStopPoint(fromStation),
      searchStopPoint(toStation)
    ]);
    const fromRef = fromStop?.icsId || fromStop?.id;
    const toRef = toStop?.icsId || toStop?.id;
    if (!fromRef || !toRef) return [];
    const data = await tflFetch(`/Journey/JourneyResults/${encodeURIComponent(fromRef)}/to/${encodeURIComponent(toRef)}`, {
      accessibilityPreference: "StepFreeToPlatform",
      mode: "tube,bus,dlr,overground,elizabeth-line,national-rail,walking"
    });
    const journeys = Array.isArray(data.journeys) ? data.journeys.slice(0, 2) : [];
    return journeys.map((journey, index) => journeyToStrategy(journey, index, apiKey, fromStation, toStation));
  };
  var isTflLiveEnabled = () => {
    if (typeof window !== "undefined") {
      const flag = window.FREEFLOW_TFL_LIVE;
      if (flag === 0 || flag === "0" || flag === false) return false;
      return true;
    }
    return Boolean(TFL_APP_KEY);
  };

  // js/modules/routeLearning.js
  var MEMORY_KEY = "freeflow_route_memory_v1";
  var MAX_EVENTS = 80;
  var sessionMemory = null;
  var NORMALISE = (name = "") => String(name).toLowerCase().replace(/['’]/g, "").replace(/\bstation\b/g, "").replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
  var pairKey = (start, end) => {
    const left = NORMALISE(start);
    const right = NORMALISE(end);
    return [left, right].sort().join("|");
  };
  var emptyMemory = () => ({
    version: 1,
    surfacePairs: {},
    hubOverrides: {},
    events: []
  });
  var loadRouteMemory = () => {
    try {
      if (typeof localStorage === "undefined") {
        return sessionMemory || emptyMemory();
      }
      const raw = JSON.parse(localStorage.getItem(MEMORY_KEY) || "null");
      if (!raw || typeof raw !== "object") return sessionMemory || emptyMemory();
      return {
        version: 1,
        surfacePairs: raw.surfacePairs && typeof raw.surfacePairs === "object" ? raw.surfacePairs : {},
        hubOverrides: raw.hubOverrides && typeof raw.hubOverrides === "object" ? raw.hubOverrides : {},
        events: Array.isArray(raw.events) ? raw.events.slice(0, MAX_EVENTS) : []
      };
    } catch (error) {
      return sessionMemory || emptyMemory();
    }
  };
  var saveRouteMemory = (memory) => {
    const next = {
      version: 1,
      surfacePairs: memory.surfacePairs || {},
      hubOverrides: memory.hubOverrides || {},
      events: (memory.events || []).slice(0, MAX_EVENTS)
    };
    sessionMemory = next;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(MEMORY_KEY, JSON.stringify(next));
      }
    } catch (error) {
    }
    return next;
  };
  var pushEvent = (memory, event) => {
    memory.events = [{ at: (/* @__PURE__ */ new Date()).toISOString(), ...event }, ...memory.events || []].slice(0, MAX_EVENTS);
  };
  var isLearnedSurfacePair = (start, end, memory = loadRouteMemory()) => {
    const entry = memory.surfacePairs?.[pairKey(start, end)];
    return Boolean(entry && (entry.weight || 0) >= 1);
  };
  var getLearnedHub = (station, memory = loadRouteMemory()) => {
    const entry = memory.hubOverrides?.[NORMALISE(station)];
    if (!entry || !entry.hub || (entry.weight || 0) < 1) return null;
    return entry.hub;
  };
  var learnSurfacePair = (start, end, {
    reason = "Local surface travel preferred",
    source = "auto",
    weight = 1,
    memory = loadRouteMemory()
  } = {}) => {
    const key = pairKey(start, end);
    const existing = memory.surfacePairs[key] || { weight: 0, reason, source, hits: 0 };
    memory.surfacePairs[key] = {
      start,
      end,
      reason,
      source,
      weight: Math.min(12, (existing.weight || 0) + weight),
      hits: (existing.hits || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    pushEvent(memory, { type: "surface", start, end, reason, source });
    return saveRouteMemory(memory);
  };
  var learnHubOverride = (station, hub, {
    reason = "Accessible hub preference",
    source = "auto",
    weight = 1,
    memory = loadRouteMemory()
  } = {}) => {
    const key = NORMALISE(station);
    const hubName = String(hub).replace(/Station,\s*London$/i, "").replace(/\s+Station$/i, "").trim();
    const existing = memory.hubOverrides[key] || { weight: 0, hub: hubName, hits: 0 };
    memory.hubOverrides[key] = {
      station,
      hub: hubName,
      reason,
      source,
      weight: Math.min(12, (existing.weight || 0) + weight),
      hits: (existing.hits || 0) + 1,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    pushEvent(memory, { type: "hub", station, hub: hubName, reason, source });
    return saveRouteMemory(memory);
  };
  var demoteHubOverride = (station, {
    reason = "Traveller feedback: hub tip demoted",
    memory = loadRouteMemory()
  } = {}) => {
    const key = NORMALISE(station);
    const existing = memory.hubOverrides?.[key];
    if (!existing) {
      pushEvent(memory, { type: "hub-demote", station, reason });
      return saveRouteMemory(memory);
    }
    const nextWeight = Math.max(0, (existing.weight || 0) - 3);
    if (nextWeight < 1) {
      delete memory.hubOverrides[key];
    } else {
      memory.hubOverrides[key] = {
        ...existing,
        weight: nextWeight,
        reason,
        source: "user",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    pushEvent(memory, { type: "hub-demote", station, hub: existing.hub, reason });
    return saveRouteMemory(memory);
  };
  var learnFromPlan = ({
    start,
    end,
    policy = {},
    liveContext = {},
    planA = null
  } = {}) => {
    let memory = loadRouteMemory();
    if (policy.preferSurfaceRoute) {
      memory = learnSurfacePair(start, end, {
        reason: "Auto-learned: both ends street-constrained in a local corridor",
        source: "auto",
        weight: 1,
        memory
      });
    }
    if (policy.originRerouteRequired && liveContext.originHub) {
      memory = learnHubOverride(start, liveContext.originHub, {
        reason: "Auto-learned origin hub from Free Flow access gate",
        source: "auto",
        weight: 1,
        memory
      });
    }
    if (policy.destinationTransferRequired && liveContext.destinationHub) {
      memory = learnHubOverride(end, liveContext.destinationHub, {
        reason: "Auto-learned destination hub from Free Flow access gate",
        source: "auto",
        weight: 1,
        memory
      });
    }
    return memory;
  };
  var learnFromFeedback = ({
    start,
    end,
    feedback,
    liveContext = {}
  } = {}) => {
    let memory = loadRouteMemory();
    if (feedback === "helpful") {
      pushEvent(memory, { type: "feedback", start, end, feedback: "helpful" });
      return saveRouteMemory(memory);
    }
    if (feedback === "prefer-surface") {
      memory = learnSurfacePair(start, end, {
        reason: "Traveller feedback: should be bus or walk",
        source: "user",
        weight: 3,
        memory
      });
      return memory;
    }
    if (feedback === "wrong-hub") {
      memory = learnSurfacePair(start, end, {
        reason: "Traveller feedback: hub plan felt wrong for this corridor",
        source: "user",
        weight: 2,
        memory
      });
      memory = demoteHubOverride(start, {
        reason: "Traveller feedback: wrong hub / Tube detour",
        memory
      });
      if (liveContext.destinationHub) {
        memory = demoteHubOverride(end, {
          reason: "Traveller feedback: wrong hub / Tube detour",
          memory
        });
      }
      pushEvent(memory, { type: "feedback", start, end, feedback: "wrong-hub" });
      return saveRouteMemory(memory);
    }
    return memory;
  };
  var memorySummary = (memory = loadRouteMemory()) => {
    const surfaceCount = Object.keys(memory.surfacePairs || {}).length;
    const hubCount = Object.keys(memory.hubOverrides || {}).length;
    const eventCount = (memory.events || []).length;
    return {
      surfaceCount,
      hubCount,
      eventCount,
      line: `Learned ${surfaceCount} surface link${surfaceCount === 1 ? "" : "s"} \xB7 ${hubCount} hub tip${hubCount === 1 ? "" : "s"} \xB7 ${eventCount} memory event${eventCount === 1 ? "" : "s"}`
    };
  };

  // js/modules/localSurface.js
  var NORMALISE2 = (name = "") => String(name).toLowerCase().replace(/['’]/g, "").replace(/\bstation\b/g, "").replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
  var GENERIC_LOCALITY = /* @__PURE__ */ new Set([
    "east",
    "west",
    "north",
    "south",
    "high",
    "new",
    "old",
    "lower",
    "upper",
    "royal",
    "wood",
    "park",
    "road",
    "street",
    "green",
    "hill",
    "cross",
    "queens",
    "kings",
    "manor",
    "gate",
    "town",
    "common"
  ]);
  var SKIP_TOKENS = /* @__PURE__ */ new Set(["the", "st", "saint", "and", "for", "of"]);
  var significantTokens = (stationName = "") => NORMALISE2(stationName).split(" ").filter((part) => part.length > 1 && !SKIP_TOKENS.has(part));
  var localityKey = (stationName = "") => {
    const parts = significantTokens(stationName);
    if (parts.length < 1) return null;
    if (NORMALISE2(stationName).split(" ").filter(Boolean).length < 2) return null;
    return parts[0] || null;
  };
  var shareLocality = (start, end) => {
    const leftTokens = significantTokens(start);
    const rightTokens = significantTokens(end);
    if (!leftTokens.length || !rightTokens.length) return false;
    const shared = leftTokens.filter((token) => rightTokens.includes(token));
    if (!shared.length) return false;
    if (shared.length >= 2) return true;
    return !GENERIC_LOCALITY.has(shared[0]);
  };
  var shouldPreferSurfaceRoute = (start, end, startAccessibility, endAccessibility, memory) => {
    if (isLearnedSurfacePair(start, end, memory)) return true;
    if (!shareLocality(start, end)) return false;
    const bothStreetBlocked = startAccessibility === "None" && endAccessibility === "None";
    const bothConstrained = ["None", "Partial"].includes(startAccessibility) && ["None", "Partial"].includes(endAccessibility);
    if (bothStreetBlocked || bothConstrained) return true;
    const ontoNearbyFull = ["None", "Partial"].includes(startAccessibility) && endAccessibility === "Full";
    const offNearbyFull = startAccessibility === "Full" && ["None", "Partial"].includes(endAccessibility);
    return ontoNearbyFull || offNearbyFull;
  };

  // js/modules/hubResolver.js
  var NORMALISE3 = (name = "") => String(name).toLowerCase().replace(/['’]/g, "").replace(/\bstation\b/g, "").replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
  var tokens = (name = "") => NORMALISE3(name).split(" ").filter((part) => part.length > 1);
  var fullStationsFrom = (stationData = stationsDataFallback) => Object.entries(stationData).filter(([, accessibility]) => accessibility === "Full").map(([name]) => name);
  var scoreHubCandidate = (station, candidate) => {
    if (!station || !candidate || station === candidate) return -1;
    const stationTokens = tokens(station);
    const candidateTokens = tokens(candidate);
    if (!candidateTokens.length) return -1;
    let score = 0;
    const stationLocality = localityKey(station);
    const candidateLocality = localityKey(candidate);
    if (stationLocality && candidateLocality && stationLocality === candidateLocality && !["east", "west", "north", "south", "high", "new", "old", "lower", "upper", "royal", "wood", "park", "road", "street", "green", "hill", "cross"].includes(stationLocality)) {
      score += 100;
    }
    stationTokens.forEach((token) => {
      if (candidateTokens.includes(token)) score += 24;
    });
    const left = NORMALISE3(station);
    const right = NORMALISE3(candidate);
    if (left && right) {
      if (right.startsWith(left) || left.startsWith(right)) score += 18;
      const shorter = left.length <= right.length ? left : right;
      const longer = left.length <= right.length ? right : left;
      if (shorter.length >= 4 && longer.includes(shorter)) score += 12;
    }
    score -= Math.min(6, Math.abs(candidateTokens.length - stationTokens.length));
    return score;
  };
  var STRONG_HUB_SCORE = 24;
  var pickBestFullHub = (station, stationData = stationsDataFallback) => {
    const fullStations = fullStationsFrom(stationData);
    if (!fullStations.length) return null;
    let bestSimilar = null;
    let bestSimilarScore = -Infinity;
    fullStations.forEach((candidate) => {
      const score = scoreHubCandidate(station, candidate);
      if (score > bestSimilarScore) {
        bestSimilarScore = score;
        bestSimilar = candidate;
      }
    });
    if (bestSimilar && bestSimilarScore >= STRONG_HUB_SCORE) return bestSimilar;
    return null;
  };
  var hasStrongHubSignal = (station, hubStation) => scoreHubCandidate(station, hubStation) >= STRONG_HUB_SCORE;
  var resolveAccessibleHubStation = (station, accessibility, stationData = stationsDataFallback) => {
    if (accessibility === "Full") return station;
    const learned = getLearnedHub(station);
    if (learned && stationData[learned] === "Full") return learned;
    return pickBestFullHub(station, stationData);
  };
  var resolveAccessibleHubLabel = (station, accessibility, stationData = stationsDataFallback) => {
    const hubStation = resolveAccessibleHubStation(station, accessibility, stationData);
    if (hubStation) return `${hubStation} Station, London`;
    return `accessible station near ${station} Station, London`;
  };
  var buildExampleJourneys = (stationData = stationsDataFallback, limit = 4) => {
    const fullStations = fullStationsFrom(stationData);
    if (fullStations.length < 2) return [];
    const pairs = [];
    const step = Math.max(1, Math.floor(fullStations.length / (limit + 1)));
    for (let i = 0; i < limit; i += 1) {
      const start = fullStations[i * step % fullStations.length];
      const end = fullStations[(i * step + Math.floor(fullStations.length / 2)) % fullStations.length];
      if (start === end) continue;
      pairs.push({ start, end });
    }
    return pairs;
  };

  // js/modules/liveContext.js
  var fallbackBreakdown = (station, accessibility, { surfaceLocal = false } = {}) => ({
    station,
    summary: surfaceLocal ? "Not street-to-train step-free \u2014 for nearby trips stay on bus or walk, do not use this Tube entrance." : accessibility === "Full" ? "Full step-free access expected from street to platform." : accessibility === "Interchange" ? "Step-free between platforms; street access may still involve steps." : accessibility === "Partial" ? "Some step-free access, but not every platform or exit." : "Not step-free \u2014 plan via an accessible hub instead.",
    details: surfaceLocal ? [
      "Avoid entering this station for a short local Tube hop.",
      "Use accessible bus stops or a surface walk instead.",
      "Re-check live conditions before you travel."
    ] : [
      accessibility === "Full" ? "Street-to-platform step-free route expected." : "Expect at least one constrained segment at this station.",
      "Ask staff for boarding ramp help if you need it.",
      "Re-check lift status before you travel."
    ]
  });
  var deterministicHubName = (station, accessibility) => resolveAccessibleHubLabel(station, accessibility, stationsDataFallback);
  var hubLabelFromStation = (stationName) => `${stationName} Station, London`;
  var resolveLiveHubLabel = async (station, accessibility) => {
    if (accessibility === "Full") return hubLabelFromStation(station);
    const nameDriven = resolveAccessibleHubStation(station, accessibility, stationsDataFallback);
    if (nameDriven && nameDriven !== station && hasStrongHubSignal(station, nameDriven)) {
      return hubLabelFromStation(nameDriven);
    }
    try {
      const nearbyFull = await fetchNearestFullHub(station, stationsDataFallback);
      if (nearbyFull) return hubLabelFromStation(nearbyFull);
    } catch (error) {
    }
    return nameDriven && nameDriven !== station ? hubLabelFromStation(nameDriven) : deterministicHubName(station, accessibility);
  };
  var liftStatusFromDisruptions = (station, accessibility, disruptions) => {
    const matches = findLiftDisruptionsForStation(disruptions, station);
    if (matches.length > 0) {
      return {
        state: "disruption",
        label: "Disruption reported",
        detail: matches[0].message || "A lift outage is affecting step-free access here."
      };
    }
    if (accessibility === "None") {
      return {
        state: "unavailable",
        label: "No full step-free lift route",
        detail: "This station is not fully step-free even when lifts are working."
      };
    }
    return {
      state: "working",
      label: "No lift outages reported",
      detail: "TfL is not currently listing a lift disruption for this station."
    };
  };
  var deterministicLiftCheck = (station, accessibility) => {
    if (accessibility === "None") {
      return {
        state: "unavailable",
        label: "No full step-free lift route",
        detail: "Live lift feed is off \u2014 based on published access only."
      };
    }
    if (accessibility === "Interchange") {
      return {
        state: "unknown",
        label: "Check interchange lifts",
        detail: "Live lift feed is off \u2014 confirm before you travel."
      };
    }
    if (accessibility === "Partial") {
      return {
        state: "unknown",
        label: "Partial access \u2014 confirm lifts",
        detail: "Live lift feed is off \u2014 some platforms may still need lifts."
      };
    }
    return {
      state: "unknown",
      label: "Live lift status unavailable",
      detail: "Could not reach TfL right now \u2014 re-check lifts on TfL Go before you travel."
    };
  };
  var collectLiftMessages = (...groups) => {
    const messages = [];
    groups.flat().forEach((item) => {
      if (item?.message && !messages.includes(item.message)) messages.push(item.message);
    });
    return messages.slice(0, 4);
  };
  var buildFallbackContext = ({ start, end, startAccessibility, endAccessibility, degradedReason }) => {
    const surfaceLocal = shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility);
    return {
      degraded: true,
      assumptions: [
        degradedReason || "Live TfL data unavailable.",
        "Guidance uses published station accessibility data.",
        "Always confirm lift and service status on the day of travel."
      ],
      originHub: deterministicHubName(start, startAccessibility),
      destinationHub: deterministicHubName(end, endAccessibility),
      disruptedLines: [],
      liftMessages: [],
      stationBreakdown: [
        fallbackBreakdown(start, startAccessibility, { surfaceLocal }),
        fallbackBreakdown(end, endAccessibility, { surfaceLocal })
      ],
      liveDepartures: [],
      departuresAreLive: false,
      liftsAreLive: false,
      liftChecks: {
        start: { station: start, ...deterministicLiftCheck(start, startAccessibility) },
        end: { station: end, ...deterministicLiftCheck(end, endAccessibility) },
        interchange: surfaceLocal ? {
          station: "Surface link",
          state: "unavailable",
          label: "No Tube interchange",
          detail: "This plan stays on bus/walk \u2014 Tube hubs are not used."
        } : {
          station: deterministicHubName(end, endAccessibility).replace(/ Station, London$/i, ""),
          ...deterministicLiftCheck(end, endAccessibility)
        }
      },
      liftStatus: {
        start: deterministicLiftCheck(start, startAccessibility).label,
        end: deterministicLiftCheck(end, endAccessibility).label,
        interchange: surfaceLocal ? "No Tube interchange" : deterministicLiftCheck(end, endAccessibility).label
      },
      journeyStrategies: []
    };
  };
  var enrichBreakdownWithLifts = (entry, disruptions) => {
    const matches = findLiftDisruptionsForStation(disruptions, entry.station);
    if (!matches.length) return entry;
    const messages = matches.map((item) => item.message).filter(Boolean).slice(0, 2);
    return {
      ...entry,
      details: [
        ...entry.details,
        ...messages
      ]
    };
  };
  var getLiveContext = async ({ start, end, startAccessibility, endAccessibility }) => {
    if (!isTflLiveEnabled()) {
      return buildFallbackContext({
        start,
        end,
        startAccessibility,
        endAccessibility,
        degradedReason: "Live TfL data unavailable."
      });
    }
    try {
      const [disruptions, liveDepartures, originHub, destinationHub] = await Promise.all([
        fetchLiftDisruptions(),
        fetchArrivalsForStation(start).catch(() => []),
        resolveLiveHubLabel(start, startAccessibility),
        resolveLiveHubLabel(end, endAccessibility)
      ]);
      const startLifts = findLiftDisruptionsForStation(disruptions, start);
      const endLifts = findLiftDisruptionsForStation(disruptions, end);
      const hubNames = [originHub, destinationHub].map((hub) => hub.replace(/ Station, London$/i, ""));
      const interchangeLifts = hubNames.flatMap((hub) => findLiftDisruptionsForStation(disruptions, hub));
      const disruptedLines = [...startLifts, ...endLifts, ...interchangeLifts].map((item) => item.stopPointName || item.message).filter(Boolean);
      const liftMessages = collectLiftMessages(startLifts, endLifts, interchangeLifts);
      const assumptions = [
        "Guidance uses published station accessibility data plus live TfL lift disruptions.",
        "Always confirm lift and service status on the day of travel."
      ];
      if (disruptedLines.length > 0) {
        assumptions.unshift("Live lift disruption reported on this corridor \u2014 prefer alternatives if unsure.");
      }
      const liftChecks = {
        start: { station: start, ...liftStatusFromDisruptions(start, startAccessibility, disruptions) },
        end: { station: end, ...liftStatusFromDisruptions(end, endAccessibility, disruptions) },
        interchange: (() => {
          const hub = hubNames[1] || hubNames[0] || end;
          const hubAccess = stationsDataFallback[hub] || endAccessibility;
          if (interchangeLifts.length > 0) {
            return {
              station: hub,
              state: "disruption",
              label: "Disruption reported",
              detail: interchangeLifts[0].message || "A lift outage is affecting an interchange on this plan."
            };
          }
          return { station: hub, ...liftStatusFromDisruptions(hub, hubAccess, disruptions) };
        })()
      };
      return {
        degraded: false,
        assumptions,
        originHub,
        destinationHub,
        disruptedLines: [...new Set(disruptedLines)],
        liftMessages,
        stationBreakdown: [
          enrichBreakdownWithLifts(
            fallbackBreakdown(start, startAccessibility, {
              surfaceLocal: shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility)
            }),
            disruptions
          ),
          enrichBreakdownWithLifts(
            fallbackBreakdown(end, endAccessibility, {
              surfaceLocal: shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility)
            }),
            disruptions
          )
        ],
        liveDepartures,
        departuresAreLive: liveDepartures.length > 0,
        liftsAreLive: true,
        liftChecks,
        liftStatus: {
          start: liftChecks.start.label,
          end: liftChecks.end.label,
          interchange: liftChecks.interchange.label
        },
        journeyStrategies: []
      };
    } catch (error) {
      return buildFallbackContext({
        start,
        end,
        startAccessibility,
        endAccessibility,
        degradedReason: "Live TfL data unavailable (request failed)."
      });
    }
  };

  // js/modules/accessPolicy.js
  var ORIGIN_REROUTE_LEVELS = ["None", "Partial", "Interchange"];
  var DESTINATION_TRANSFER_LEVELS = ["None", "Partial", "Interchange"];
  var classifyAccessibilityScenario = (startAccessibility, endAccessibility) => `${startAccessibility}->${endAccessibility}`;
  var resolveAccessPolicy = (startAccessibility, endAccessibility, profile = {}, stations = {}) => {
    const wheelchairStrict = Boolean(profile.wheelchair);
    const start = stations.start || "";
    const end = stations.end || "";
    const memory = stations.memory || loadRouteMemory();
    const preferSurfaceRoute = Boolean(start && end) && shouldPreferSurfaceRoute(start, end, startAccessibility, endAccessibility, memory);
    const originRerouteRequired = !preferSurfaceRoute && ORIGIN_REROUTE_LEVELS.includes(startAccessibility);
    const destinationTransferRequired = !preferSurfaceRoute && DESTINATION_TRANSFER_LEVELS.includes(endAccessibility);
    return {
      scenario: classifyAccessibilityScenario(startAccessibility, endAccessibility),
      originRerouteRequired,
      destinationTransferRequired,
      preferSurfaceRoute,
      wheelchairStrict,
      streetAccessRisk: {
        origin: startAccessibility !== "Full",
        destination: endAccessibility !== "Full"
      },
      accessFirst: preferSurfaceRoute || originRerouteRequired || destinationTransferRequired
    };
  };

  // js/modules/tflTrust.js
  var assessTflTrust = ({
    startAccessibility,
    endAccessibility,
    policy,
    usedHubQuery = false,
    liveJourneyCount = 0
  }) => {
    const conflicts = [];
    if (policy?.preferSurfaceRoute) {
      conflicts.push({
        code: "LOCAL_SURFACE",
        detail: "Both ends lack street-to-train access in the same local area. Free Flow prefers bus/walk \u2014 TfL often still suggests Tube."
      });
    }
    if (policy?.originRerouteRequired) {
      conflicts.push({
        code: "ORIGIN_STREET_ACCESS",
        detail: `Published access at origin is \u201C${startAccessibility}\u201D. TfL step-free journeys can still leave street steps \u2014 Free Flow starts via an accessible hub.`
      });
    }
    if (policy?.destinationTransferRequired) {
      conflicts.push({
        code: "DESTINATION_STREET_ACCESS",
        detail: `Published access at destination is \u201C${endAccessibility}\u201D. Free Flow leaves rail at an accessible hub before the final approach.`
      });
    }
    if (policy?.wheelchairStrict && (startAccessibility === "Interchange" || endAccessibility === "Interchange")) {
      conflicts.push({
        code: "INTERCHANGE_NOT_STREET",
        detail: "Wheelchair profile on: interchange-only stations are treated as street-constrained until confirmed Full step-free."
      });
    }
    const corrected = conflicts.length > 0;
    let trustLevel = "aligned";
    let trustLabel = "Published Full access aligns with step-free planning";
    if (policy?.preferSurfaceRoute) {
      trustLevel = "surface";
      trustLabel = "Free Flow chose surface travel over a misleading Tube hop";
    } else if (corrected && usedHubQuery) {
      trustLevel = "corrected";
      trustLabel = "Free Flow corrected TfL street-access gaps with accessible hubs";
    } else if (corrected) {
      trustLevel = "override";
      trustLabel = "Free Flow overrides risky street access even when TfL looks step-free";
    } else if (liveJourneyCount > 0) {
      trustLevel = "live-agreed";
      trustLabel = "Live TfL timing used where published access is Full";
    }
    return {
      corrected,
      trustLevel,
      trustLabel,
      conflicts,
      usedHubQuery: Boolean(usedHubQuery),
      liveJourneyCount,
      differsFromTfl: corrected
    };
  };
  var trustBannerCopy = (trust) => {
    if (!trust?.differsFromTfl) return null;
    const conflictLines = (trust.conflicts || []).map((item) => item.detail);
    return {
      title: trust.trustLabel,
      body: "TfL\u2019s journey planner optimises for \u201Cstep-free to platform\u201D, which is not the same as street-to-train access. Free Flow uses published station categories as the hard gate.",
      items: conflictLines
    };
  };

  // js/modules/routingEngine.js
  var ACCESSIBILITY_WEIGHT = { Full: 3, Interchange: 2, Partial: 1, None: 0 };
  var getDirectionFlag = (mode) => {
    if (mode === "walking") return "w";
    if (mode === "transit") return "r";
    if (mode === "driving") return "d";
    return "";
  };
  var createMapUrl = (apiKey, origin, destination, mode, waypoints = []) => {
    if (apiKey) {
      let url2 = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}&zoom=12`;
      if (waypoints.length > 0) url2 += `&waypoints=${encodeURIComponent(waypoints.join("|"))}`;
      return url2;
    }
    const dirFlag = getDirectionFlag(mode);
    const fullDestination = [...waypoints, destination].join(" to:");
    let url = `https://maps.google.com/maps?output=embed&hl=en&saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(fullDestination)}`;
    if (dirFlag) {
      url += `&dirflg=${encodeURIComponent(dirFlag)}`;
    }
    return url;
  };
  var baseStep = (type, text) => ({ type, text });
  var hubToStationName = (hub = "") => {
    const raw = String(hub).trim();
    if (!raw) return "";
    if (/^accessible station near\b/i.test(raw)) return "";
    return raw.replace(/,\s*London$/i, "").replace(/\s+Station$/i, "").trim();
  };
  var wrapLiveStrategyWithAccessLegs = (strategy, {
    apiKey,
    start,
    end,
    policy,
    originHub,
    destinationHub
  }) => {
    const steps = [...strategy.steps || []];
    if (policy.originRerouteRequired) {
      steps.unshift(baseStep("bus", `Start with bus/walk transfer from ${start} to accessible hub ${originHub}.`));
    }
    if (policy.destinationTransferRequired) {
      steps.push(baseStep(
        "bus",
        `Important: leave the Tube at the accessible hub. Take a bus (or short walk) to ${end} \u2014 do not rely on street access at ${end}.`
      ));
    }
    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const effectiveOrigin = policy.originRerouteRequired ? originHub : startStation;
    const railDestination = policy.destinationTransferRequired ? destinationHub : endStation;
    return {
      ...strategy,
      title: policy.accessFirst ? `Hub-corrected TfL timing (${strategy.title})` : strategy.title,
      badge: policy.accessFirst ? "TfL + Free Flow hubs" : strategy.badge,
      freeflowVerified: true,
      tflCorrected: Boolean(policy.accessFirst),
      steps,
      mapUrl: createMapUrl(apiKey, effectiveOrigin, railDestination, "transit"),
      waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, railDestination, "transit"),
      finalLegMapUrl: createMapUrl(
        apiKey,
        destinationHub,
        endStation,
        policy.destinationTransferRequired ? "walking" : "transit"
      ),
      rationale: policy.accessFirst ? `${strategy.rationale} Free Flow rewrote street access via accessible hubs because TfL step-free labels are not street-to-train truth.` : `${strategy.rationale} Published Full access agrees with this corridor.`
    };
  };
  var countInterchanges = (steps = []) => {
    const transitLegs = steps.filter((step) => step.type && step.type !== "walk").length;
    return Math.max(0, transitLegs - 1);
  };
  var buildScenarioStrategies = (apiKey, start, end, startAccessibility, endAccessibility, hubs, policy) => {
    const scenario = policy.scenario || classifyAccessibilityScenario(startAccessibility, endAccessibility);
    const startStation = `${start} Station, London`;
    const endStation = `${end} Station, London`;
    const originHub = hubs.originHub || `accessible station near ${start} Station, London`;
    const destinationHub = hubs.destinationHub || `accessible station near ${end} Station, London`;
    const effectiveOrigin = policy.originRerouteRequired ? originHub : startStation;
    const baseTube = {
      id: "tube-core",
      title: "Tube-first core route",
      badge: "Tube-first",
      freeflowVerified: true,
      rationale: "Uses Tube and rail first wherever published street-to-train access appears feasible.",
      mapUrl: createMapUrl(apiKey, effectiveOrigin, endStation, "transit"),
      waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, endStation, "transit", [destinationHub]),
      finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, "transit"),
      steps: [baseStep("tube", `Travel from ${effectiveOrigin} toward ${end}.`)],
      interchangeCount: 0
    };
    if (policy.preferSurfaceRoute) {
      const ontoFullHub = endAccessibility === "Full" && ["None", "Partial"].includes(startAccessibility);
      const offFullHub = startAccessibility === "Full" && ["None", "Partial"].includes(endAccessibility);
      const surfaceRationale = ontoFullHub ? `${end} is the nearby step-free station for this short local hop. Bus or walk from ${start} \u2014 a Tube detour is unnecessary.` : offFullHub ? `${start} is already step-free; finish the short local hop to ${end} by bus or walk rather than another rail leg.` : "Both stations lack street-to-train access and are in the same local area. A Tube hop via hubs would be longer and still force inaccessible street access \u2014 stay on bus or walk.";
      const surfaceDirect = {
        id: "surface-direct",
        title: "Direct bus or walk",
        badge: "Surface-first",
        freeflowVerified: true,
        surfaceRoute: true,
        rationale: surfaceRationale,
        mapUrl: createMapUrl(apiKey, startStation, endStation, "transit"),
        waypointMapUrl: createMapUrl(apiKey, startStation, endStation, "walking"),
        finalLegMapUrl: createMapUrl(apiKey, startStation, endStation, "walking"),
        steps: [
          baseStep("bus", ontoFullHub ? `Take a local accessible bus (or short walk) from ${start} to step-free ${end}. Do not start a longer Tube trip for this local hop.` : `Take a local accessible bus between ${start} and ${end} \u2014 do not enter either station for a short Tube hop.`),
          baseStep("walk", `Or walk the short local link if it fits your access profile and max walk time.`)
        ]
      };
      surfaceDirect.interchangeCount = countInterchanges(surfaceDirect.steps);
      const surfaceWalk = {
        id: "surface-walk",
        title: "Walk-first local link",
        badge: "Walk",
        freeflowVerified: true,
        surfaceRoute: true,
        rationale: "Short local surface link without using inaccessible Tube stations.",
        mapUrl: createMapUrl(apiKey, startStation, endStation, "walking"),
        waypointMapUrl: createMapUrl(apiKey, startStation, endStation, "walking"),
        finalLegMapUrl: createMapUrl(apiKey, startStation, endStation, "walking"),
        steps: [
          baseStep("walk", `Walk from ${start} toward ${end} on the surface. Avoid Tube entrances at both ends.`)
        ],
        interchangeCount: 0
      };
      const hubBackup = {
        id: "hub-backup",
        title: "Only if you must use rail",
        badge: "Backup",
        freeflowVerified: true,
        rationale: "Contingency only: if you need rail, reach nearby accessible hubs \u2014 not a good default for this short local trip.",
        mapUrl: createMapUrl(apiKey, originHub, destinationHub, "transit"),
        waypointMapUrl: createMapUrl(apiKey, originHub, destinationHub, "transit"),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, "walking"),
        steps: [
          baseStep("bus", `Reach ${originHub} from ${start} using an accessible transfer.`),
          baseStep("tube", `Travel to ${destinationHub} by Tube.`),
          baseStep("walk", `Complete final transfer to ${end}.`)
        ]
      };
      hubBackup.interchangeCount = countInterchanges(hubBackup.steps);
      return {
        scenario,
        policy,
        strategies: [surfaceDirect, surfaceWalk, hubBackup]
      };
    }
    if (startAccessibility === "Full" && endAccessibility === "Full") {
      const busBackup = {
        id: "bus-backup",
        title: "Bus fallback route",
        badge: "Backup",
        freeflowVerified: true,
        rationale: "Use this if lifts fail or disruption affects rail access.",
        mapUrl: createMapUrl(apiKey, startStation, endStation, "transit", [destinationHub]),
        waypointMapUrl: createMapUrl(apiKey, startStation, endStation, "transit", [originHub, destinationHub]),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, "transit"),
        steps: [baseStep("bus", `Switch to bus near ${destinationHub} if needed.`)],
        interchangeCount: 0
      };
      return {
        scenario,
        policy,
        strategies: [baseTube, busBackup]
      };
    }
    if (startAccessibility === "Full" && endAccessibility === "Partial" && !policy.originRerouteRequired) {
      const partialMain = {
        id: "partial-destination-transfer",
        title: "Accessible interchange then bus finish",
        badge: "Bus finish required",
        freeflowVerified: true,
        rationale: "Stay on Tube for the main trip, then finish by bus or a short walk where destination street access is constrained.",
        mapUrl: createMapUrl(apiKey, startStation, destinationHub, "transit"),
        waypointMapUrl: createMapUrl(apiKey, startStation, destinationHub, "transit"),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, "walking"),
        steps: [
          baseStep("tube", `Take Tube from ${start} to ${destinationHub}.`),
          baseStep("bus", `Leave the Tube at ${destinationHub}. Take an accessible bus (or short walk) into ${end} if platform access is constrained.`)
        ]
      };
      partialMain.interchangeCount = countInterchanges(partialMain.steps);
      const partialAlt = {
        id: "partial-destination-bus-first-final",
        title: "Early bus switch for predictable final access",
        badge: "Bus finish",
        freeflowVerified: true,
        rationale: "Switch to bus before destination to avoid uncertain platform constraints.",
        mapUrl: createMapUrl(apiKey, startStation, destinationHub, "transit"),
        waypointMapUrl: createMapUrl(apiKey, startStation, destinationHub, "transit"),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, "walking"),
        steps: [
          baseStep("tube", `Travel by Tube from ${start} to ${destinationHub}.`),
          baseStep("bus", `Finish by bus (or short walk) from ${destinationHub} into ${end}.`)
        ]
      };
      partialAlt.interchangeCount = countInterchanges(partialAlt.steps);
      return {
        scenario,
        policy,
        strategies: [partialMain, partialAlt]
      };
    }
    const constrained = policy.accessFirst || ["None", "Partial", "Interchange"].includes(startAccessibility) || ["None", "Partial", "Interchange"].includes(endAccessibility);
    if (constrained) {
      const firstStep = policy.originRerouteRequired ? baseStep("bus", `Start with a bus (or short walk) from ${start} to accessible hub ${originHub}.`) : baseStep("tube", `Take the Tube from ${start}.`);
      const needsBusFinish = Boolean(policy.destinationTransferRequired);
      const needsBusStart = Boolean(policy.originRerouteRequired);
      const accessHub = {
        id: "access-hub",
        title: needsBusStart && needsBusFinish ? "Bus links + Tube between hubs" : needsBusFinish ? "Tube, then bus to finish" : needsBusStart ? "Bus to hub, then Tube" : "Accessible hub transfer",
        badge: needsBusFinish ? "Bus finish required" : needsBusStart ? "Bus start required" : "Free Flow verified",
        freeflowVerified: true,
        rationale: needsBusFinish ? `${end} is not street-to-train step-free. Travel by Tube to an accessible hub, then finish by bus or a short walk \u2014 do not exit for street access at ${end}.` : "Access-first plan: published station categories force hubs where TfL street access can be wrong.",
        mapUrl: createMapUrl(apiKey, originHub, destinationHub, "transit"),
        waypointMapUrl: createMapUrl(apiKey, effectiveOrigin, destinationHub, "transit", [originHub]),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, needsBusFinish ? "walking" : "transit"),
        steps: [
          firstStep,
          baseStep("tube", `Travel by Tube to accessible interchange ${destinationHub}.`),
          needsBusFinish ? baseStep(
            "bus",
            `Leave the Tube at ${destinationHub}. Take an accessible bus (or short walk) to ${end} \u2014 ${end} is not street-to-train step-free.`
          ) : baseStep("walk", `Continue directly to ${end}.`)
        ]
      };
      accessHub.interchangeCount = countInterchanges(accessHub.steps);
      const hubBackup = {
        id: "hub-backup",
        title: "Conservative fallback via accessible hubs",
        badge: "Backup",
        freeflowVerified: true,
        rationale: "Maximises accessibility certainty over speed when lifts or street access fail.",
        mapUrl: createMapUrl(apiKey, originHub, destinationHub, "transit"),
        waypointMapUrl: createMapUrl(apiKey, originHub, destinationHub, "transit"),
        finalLegMapUrl: createMapUrl(apiKey, destinationHub, endStation, "walking"),
        steps: [
          baseStep("bus", `Reach ${originHub} from ${start} using an accessible bus or walk.`),
          baseStep("tube", `Travel to ${destinationHub} by Tube.`),
          baseStep("bus", `Finish by bus (or short walk) from ${destinationHub} to ${end}.`)
        ]
      };
      hubBackup.interchangeCount = countInterchanges(hubBackup.steps);
      return {
        scenario,
        policy,
        strategies: [accessHub, hubBackup]
      };
    }
    return { scenario, policy, strategies: [baseTube] };
  };
  var scoreStrategy = (strategy, startAccessibility, endAccessibility, disruptedLines, profile = {}, policy = {}) => {
    const accessFirst = Boolean(policy.accessFirst);
    const preferSurface = Boolean(policy.preferSurfaceRoute);
    const accessScore = ACCESSIBILITY_WEIGHT[startAccessibility] + ACCESSIBILITY_WEIGHT[endAccessibility];
    const railPenalty = disruptedLines.length > 0 ? 1 : 0;
    const verifiedBonus = strategy.freeflowVerified ? 4 : 0;
    const hubBonus = strategy.id.includes("hub") || strategy.id.includes("transfer") ? 2 : 0;
    const surfaceBonus = strategy.surfaceRoute || String(strategy.id).includes("surface") ? 12 : 0;
    const liveBonus = strategy.tflLive ? preferSurface ? 0 : accessFirst ? 1 : 5 : 0;
    const accessFirstHubBonus = accessFirst && !preferSurface && !strategy.tflLive && strategy.freeflowVerified && !strategy.surfaceRoute ? 6 : 0;
    const durationBonus = typeof strategy.durationMins === "number" ? Math.max(0, 3 - Math.floor(strategy.durationMins / 30)) : 0;
    const interchangePenalty = typeof strategy.interchangeCount === "number" ? Math.min(2, strategy.interchangeCount) : 0;
    const walkPenalty = profile.maxWalkMins && (strategy.steps || []).filter((step) => step.type === "walk").length * 4 > profile.maxWalkMins ? 1 : 0;
    const fewChangesBonus = profile.wheelchair && (strategy.interchangeCount || 0) <= 1 ? 1 : 0;
    const noEscalatorBonus = profile.noEscalators && (strategy.surfaceRoute || String(strategy.id).includes("surface")) ? 3 : profile.noEscalators && (strategy.steps || []).every((step) => step.type !== "tube") ? 2 : 0;
    return accessScore + verifiedBonus + hubBonus + surfaceBonus + liveBonus + accessFirstHubBonus + durationBonus + fewChangesBonus + noEscalatorBonus - railPenalty - interchangePenalty - walkPenalty;
  };
  var buildDynamicRecommendations = async ({
    apiKey,
    start,
    end,
    startAccessibility,
    endAccessibility,
    profile = {}
  }) => {
    const liveContext = await getLiveContext({ start, end, startAccessibility, endAccessibility });
    const assumptions = [
      "Lift and service status may change before travel; check again before departure.",
      "Free Flow treats published station accessibility as the hard gate. TfL \u201Cstep-free to platform\u201D is not street-to-train truth.",
      ...liveContext.assumptions
    ];
    const policy = resolveAccessPolicy(startAccessibility, endAccessibility, profile, { start, end });
    const { scenario, strategies } = buildScenarioStrategies(
      apiKey,
      start,
      end,
      startAccessibility,
      endAccessibility,
      {
        originHub: liveContext.originHub,
        destinationHub: liveContext.destinationHub
      },
      policy
    );
    let journeyStrategies = [];
    let journeyDegraded = false;
    let usedHubQuery = false;
    if (isTflLiveEnabled() && !policy.preferSurfaceRoute) {
      try {
        const fromHub = hubToStationName(liveContext.originHub);
        const toHub = hubToStationName(liveContext.destinationHub);
        const fromStation = policy.originRerouteRequired && fromHub ? fromHub : start;
        const toStation = policy.destinationTransferRequired && toHub ? toHub : end;
        usedHubQuery = fromStation !== start || toStation !== end;
        const liveStrategies = await fetchStepFreeJourneyStrategies({
          fromStation,
          toStation,
          apiKey
        });
        journeyStrategies = liveStrategies.map((strategy) => wrapLiveStrategyWithAccessLegs(strategy, {
          apiKey,
          start,
          end,
          policy,
          originHub: liveContext.originHub,
          destinationHub: liveContext.destinationHub
        }));
        if (usedHubQuery) {
          assumptions.push(
            `TfL rail timing was requested between accessible hubs (${fromStation} \u2192 ${toStation}), not the constrained street stations.`
          );
        }
      } catch (error) {
        journeyDegraded = true;
        assumptions.push("TfL step-free journey lookup failed; showing Free Flow hub-based guidance.");
      }
    } else if (policy.preferSurfaceRoute) {
      assumptions.push(
        `Local surface journey: ${start} and ${end} both lack street-to-train access in the same area \u2014 Free Flow prefers bus/walk over Tube hubs.`
      );
    }
    const trust = assessTflTrust({
      startAccessibility,
      endAccessibility,
      policy,
      usedHubQuery,
      liveJourneyCount: journeyStrategies.length
    });
    if (trust.differsFromTfl) {
      assumptions.push(trust.trustLabel);
      trust.conflicts.forEach((conflict) => assumptions.push(conflict.detail));
    }
    const rankedLive = journeyStrategies.map((strategy) => ({
      ...strategy,
      score: scoreStrategy(
        strategy,
        startAccessibility,
        endAccessibility,
        liveContext.disruptedLines || [],
        profile,
        policy
      )
    })).sort((a, b) => b.score - a.score);
    const rankedHub = strategies.map((strategy) => ({
      ...strategy,
      score: scoreStrategy(
        strategy,
        startAccessibility,
        endAccessibility,
        liveContext.disruptedLines || [],
        profile,
        policy
      ),
      contingency: true
    })).sort((a, b) => b.score - a.score);
    let recommended;
    let alternatives;
    if (policy.preferSurfaceRoute || policy.accessFirst) {
      recommended = rankedHub[0] || rankedLive[0];
      alternatives = [
        ...rankedHub.filter((item) => item !== recommended),
        ...rankedLive
      ];
    } else {
      recommended = rankedLive[0] || rankedHub[0];
      alternatives = rankedLive.length > 0 ? [...rankedLive.slice(1), ...rankedHub] : rankedHub.slice(1);
    }
    const degraded = liveContext.degraded || journeyDegraded;
    const memory = learnFromPlan({
      start,
      end,
      policy,
      liveContext,
      planA: recommended
    });
    const learned = memorySummary(memory);
    if (learned.surfaceCount || learned.hubCount) {
      assumptions.push(`On-device learning: ${learned.line}.`);
    }
    return {
      scenario,
      degraded,
      assumptions,
      recommended,
      alternatives,
      planA: recommended,
      planB: alternatives[0] || null,
      trust,
      learning: learned,
      liveContext: {
        ...liveContext,
        journeyStrategies
      },
      policy
    };
  };

  // js/modules/stationSearch.js
  var ACCESS_META = {
    Full: { label: "Full step-free", short: "Full", rank: 4, className: "access-full" },
    Interchange: { label: "Interchange only", short: "Interchange", rank: 3, className: "access-interchange" },
    Partial: { label: "Partial step-free", short: "Partial", rank: 2, className: "access-partial" },
    None: { label: "Not step-free", short: "None", rank: 1, className: "access-none" }
  };
  var normaliseSearchText = (value = "") => String(value).toLowerCase().replace(/['’]/g, "");
  var getAccessMeta = (level) => ACCESS_META[level] || {
    label: "Unknown access",
    short: "Unknown",
    rank: 0,
    className: "access-unknown"
  };
  var scoreJourneyAccess = (startLevel, endLevel) => {
    const start = getAccessMeta(startLevel).rank;
    const end = getAccessMeta(endLevel).rank;
    const total = start + end;
    if (startLevel === "Full" && endLevel === "Full") {
      return { score: 98, grade: "Excellent", summary: "Both stations are fully step-free." };
    }
    if (total >= 6) {
      return { score: 82, grade: "Strong", summary: "Most of this journey should stay step-free with careful interchange checks." };
    }
    if (total >= 4) {
      return { score: 64, grade: "Plan carefully", summary: "Expect at least one constrained segment and prepare a transfer option." };
    }
    return { score: 38, grade: "Constrained", summary: "This journey needs accessible hubs and transfer planning." };
  };
  var StationCombobox = class {
    constructor({
      input,
      listbox,
      select,
      badge,
      stations = [],
      getFilterMode: getFilterMode2 = () => "all",
      onChange = () => {
      }
    }) {
      this.input = input;
      this.listbox = listbox;
      this.select = select;
      this.badge = badge;
      this.stations = stations;
      this.getFilterMode = getFilterMode2;
      this.onChange = onChange;
      this.activeIndex = -1;
      this.open = false;
      this.boundId = `${input.id}-listbox`;
      this.listbox.id = this.boundId;
      this.input.setAttribute("aria-controls", this.boundId);
      this.input.setAttribute("aria-autocomplete", "list");
      this.input.setAttribute("aria-expanded", "false");
      this.input.setAttribute("role", "combobox");
      this.listbox.setAttribute("role", "listbox");
      this.setupEvents();
    }
    setStations(stations) {
      this.stations = stations;
    }
    setupEvents() {
      this.input.addEventListener("input", () => {
        this.renderOptions(this.input.value);
        this.openList();
      });
      this.input.addEventListener("focus", () => {
        this.input.select();
        this.renderOptions(this.input.value);
        this.openList();
      });
      this.input.addEventListener("keydown", (event) => this.onKeyDown(event));
      this.input.addEventListener("blur", () => {
        window.setTimeout(() => this.commitTypedValue(), 0);
      });
      this.listbox.addEventListener("mousedown", (event) => {
        const option = event.target.closest('[role="option"]');
        if (!option) return;
        event.preventDefault();
        this.selectStation(option.dataset.value);
      });
      document.addEventListener("click", (event) => {
        if (!this.input.closest(".station-combobox")?.contains(event.target)) {
          this.closeList();
        }
      });
    }
    filteredStations(query = "") {
      const normalised = normaliseSearchText(query.trim());
      const mode = this.getFilterMode();
      return this.stations.filter((station) => {
        if (mode === "step-free" && !["Full", "Partial", "Interchange"].includes(station.accessibility)) {
          return false;
        }
        if (!normalised) return true;
        return normaliseSearchText(station.name).includes(normalised);
      }).slice(0, 12);
    }
    renderOptions(query = "") {
      const matches = this.filteredStations(query);
      this.listbox.innerHTML = "";
      this.activeIndex = -1;
      if (matches.length === 0) {
        const empty = document.createElement("li");
        empty.className = "combobox-empty";
        empty.textContent = modeMessage(this.getFilterMode());
        this.listbox.appendChild(empty);
        return;
      }
      matches.forEach((station, index) => {
        const meta = getAccessMeta(station.accessibility);
        const option = document.createElement("li");
        option.id = `${this.boundId}-opt-${index}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", "false");
        option.dataset.value = station.name;
        option.innerHTML = `
                <span class="combobox-name">${escapeText(station.name)}</span>
                <span class="access-chip ${meta.className}">${escapeText(meta.label)}</span>
            `;
        this.listbox.appendChild(option);
      });
    }
    onKeyDown(event) {
      const options = [...this.listbox.querySelectorAll('[role="option"]')];
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.openList();
        this.setActive(Math.min(this.activeIndex + 1, options.length - 1), options);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        this.setActive(Math.max(this.activeIndex - 1, 0), options);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (this.open && this.activeIndex >= 0 && options[this.activeIndex]) {
          this.selectStation(options[this.activeIndex].dataset.value);
          return;
        }
        const typed = normaliseSearchText(this.input.value.trim());
        const exact = this.stations.find((station) => normaliseSearchText(station.name) === typed);
        const firstVisible = options[0]?.dataset.value;
        if (exact) {
          this.selectStation(exact.name);
        } else if (firstVisible) {
          this.selectStation(firstVisible);
        }
      } else if (event.key === "Escape") {
        this.closeList();
      }
    }
    setActive(index, options) {
      options.forEach((option) => option.setAttribute("aria-selected", "false"));
      this.activeIndex = index;
      if (index < 0 || !options[index]) {
        this.input.removeAttribute("aria-activedescendant");
        return;
      }
      options[index].setAttribute("aria-selected", "true");
      this.input.setAttribute("aria-activedescendant", options[index].id);
      options[index].scrollIntoView({ block: "nearest" });
    }
    openList() {
      this.open = true;
      this.listbox.hidden = false;
      this.input.setAttribute("aria-expanded", "true");
    }
    closeList() {
      this.open = false;
      this.listbox.hidden = true;
      this.input.setAttribute("aria-expanded", "false");
      this.input.removeAttribute("aria-activedescendant");
      this.activeIndex = -1;
    }
    selectStation(name) {
      const station = this.stations.find((item) => item.name === name);
      if (!station) return;
      this.input.value = station.name;
      this.select.value = station.name;
      this.select.dispatchEvent(new Event("change", { bubbles: true }));
      this.updateBadge(station.accessibility);
      this.closeList();
      this.onChange(station);
    }
    commitTypedValue() {
      const typed = this.input.value.trim();
      if (!typed) {
        this.select.value = "";
        this.updateBadge("");
        return "";
      }
      if (this.select.value && normaliseSearchText(this.select.value) === normaliseSearchText(typed)) {
        if (this.select.value !== typed) this.input.value = this.select.value;
        return this.select.value;
      }
      const exact = this.stations.find(
        (station) => normaliseSearchText(station.name) === normaliseSearchText(typed)
      );
      if (exact) {
        this.selectStation(exact.name);
        return exact.name;
      }
      this.select.value = "";
      this.updateBadge("");
      return "";
    }
    updateBadge(level) {
      if (!this.badge) return;
      if (!level) {
        this.badge.textContent = "";
        this.badge.className = "access-chip";
        return;
      }
      const meta = getAccessMeta(level);
      this.badge.className = `access-chip ${meta.className}`;
      this.badge.textContent = meta.label;
    }
    clear() {
      this.input.value = "";
      this.select.value = "";
      this.updateBadge("");
      this.closeList();
    }
    setValue(name) {
      if (!name) {
        this.clear();
        return;
      }
      this.selectStation(name);
    }
    getValue() {
      return this.commitTypedValue() || this.select.value;
    }
  };
  var modeMessage = (mode) => mode === "step-free" ? "No matching step-free stations. Try a different spelling or turn off the step-free filter." : "No matching stations. Try a different spelling.";
  var escapeText = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  // js/modules/accessProfile.js
  var PROFILE_KEY = "freeflow_access_profile";
  var DEFAULT_PROFILE = {
    wheelchair: false,
    noEscalators: false,
    rampNeeded: false,
    maxWalkMins: 10
  };
  var loadAccessProfile = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
      return {
        wheelchair: Boolean(raw.wheelchair),
        noEscalators: Boolean(raw.noEscalators),
        rampNeeded: Boolean(raw.rampNeeded),
        maxWalkMins: Number.isFinite(Number(raw.maxWalkMins)) ? Number(raw.maxWalkMins) : DEFAULT_PROFILE.maxWalkMins
      };
    } catch (error) {
      return { ...DEFAULT_PROFILE };
    }
  };
  var saveAccessProfile = (profile) => {
    const next = {
      wheelchair: Boolean(profile.wheelchair),
      noEscalators: Boolean(profile.noEscalators),
      rampNeeded: Boolean(profile.rampNeeded),
      maxWalkMins: Math.max(1, Math.min(45, Number(profile.maxWalkMins) || DEFAULT_PROFILE.maxWalkMins))
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    return next;
  };
  var profileSummary = (profile) => {
    const parts = [];
    if (profile.wheelchair) parts.push("wheelchair / scooter");
    if (profile.noEscalators) parts.push("no escalators");
    if (profile.rampNeeded) parts.push("boarding ramp");
    parts.push(`max walk ${profile.maxWalkMins} mins`);
    return parts.join(" \xB7 ");
  };
  var readProfileFromForm = (root = document) => ({
    wheelchair: Boolean(root.querySelector("#profile-wheelchair")?.checked),
    noEscalators: Boolean(root.querySelector("#profile-no-escalators")?.checked),
    rampNeeded: Boolean(root.querySelector("#profile-ramp")?.checked),
    maxWalkMins: Number(root.querySelector("#profile-max-walk")?.value) || DEFAULT_PROFILE.maxWalkMins
  });
  var writeProfileToForm = (profile, root = document) => {
    const wheelchair = root.querySelector("#profile-wheelchair");
    const noEscalators = root.querySelector("#profile-no-escalators");
    const ramp = root.querySelector("#profile-ramp");
    const maxWalk = root.querySelector("#profile-max-walk");
    if (wheelchair) wheelchair.checked = profile.wheelchair;
    if (noEscalators) noEscalators.checked = profile.noEscalators;
    if (ramp) ramp.checked = profile.rampNeeded;
    if (maxWalk) maxWalk.value = String(profile.maxWalkMins);
  };

  // js/modules/journeyGuidance.js
  var buildJourneyGuidance = (start, end, startAccessibility, endAccessibility, policy = {}) => {
    if (policy.preferSurfaceRoute) {
      const ontoFull = endAccessibility === "Full" && ["None", "Partial"].includes(startAccessibility);
      const offFull = startAccessibility === "Full" && ["None", "Partial"].includes(endAccessibility);
      if (ontoFull) {
        return {
          headline: `${end} is the nearby step-free station. Bus or walk from ${start} \u2014 skip a longer Tube detour for this local hop.`,
          items: [
            `Do this now: take a local accessible bus or walk from ${start} to step-free ${end}.`
          ]
        };
      }
      if (offFull) {
        return {
          headline: `${start} is already step-free. Finish the short local hop to ${end} by bus or walk.`,
          items: [
            `Do this now: leave ${start} on the surface and take a local bus or walk to ${end}.`
          ]
        };
      }
      return {
        headline: "Both stations are nearby and not street-to-train step-free. Stay on the surface \u2014 bus or walk \u2014 instead of a Tube detour.",
        items: [
          `Do this now: take a local accessible bus or walk between ${start} and ${end}. Do not enter either Tube station for a short hop.`
        ]
      };
    }
    if (startAccessibility === "Full" && endAccessibility === "Partial") {
      return {
        headline: "Destination access is limited. Stay on rail for the main trip, then transfer for the last section.",
        items: [
          `Do this now: travel by Tube from ${start}, then leave at an accessible interchange before ${end}.`
        ]
      };
    }
    if (startAccessibility === "None" && endAccessibility === "None") {
      return {
        headline: "Neither station is step-free. Free Flow uses accessible hubs at both ends \u2014 do not rely on TfL \u201Cstep-free\u201D labels alone.",
        items: [
          `Do this now: reach an accessible hub near ${start}, travel by Tube, then leave at an accessible hub near ${end}.`
        ]
      };
    }
    if (startAccessibility === "None") {
      return {
        headline: "Origin is not street-to-train step-free. Free Flow starts via an accessible hub (TfL can still suggest the inaccessible station).",
        items: [
          `Do this now: use bus or a short walk from ${start} to an accessible hub, then travel by Tube toward ${end}.`
        ]
      };
    }
    if (endAccessibility === "None") {
      return {
        headline: `${end} is not street-to-train step-free \u2014 you will need a bus (or short walk) at the end.`,
        items: [
          `Do this now: travel by Tube to an accessible hub near ${end}, then take a bus or short walk. Do not exit ${end} expecting street-to-train access.`
        ]
      };
    }
    if (startAccessibility === "Partial" || endAccessibility === "Partial") {
      return {
        headline: "This journey has partial step-free access. Platform checks are required.",
        items: ["Do this now: confirm platform and exit access before departure."]
      };
    }
    if (startAccessibility === "Interchange" || endAccessibility === "Interchange") {
      return {
        headline: "Interchange step-free is not the same as street-to-train access. Confirm both before you travel.",
        items: ["Do this now: follow signed interchange routes and allow extra transfer time."]
      };
    }
    return {
      headline: "A direct step-free route looks available \u2014 still keep Plan B ready.",
      items: ["Do this now: follow Plan A, and keep the contingency ready if lifts fail."]
    };
  };

  // js/modules/mapStages.js
  var shortHub = (hub = "") => String(hub).replace(/,\s*London$/i, "").replace(/\s+Station$/i, "").trim() || "accessible hub";
  var stage = (fields) => fields;
  var buildMapStages = ({
    option,
    start,
    end,
    policy = {},
    originHub = "",
    destinationHub = ""
  }) => {
    if (!option) return [];
    const origin = shortHub(originHub) || start;
    const destination = shortHub(destinationHub) || end;
    if (policy.preferSurfaceRoute || option.surfaceRoute) {
      return [
        stage({
          id: "via",
          label: "1. Bus / surface",
          hint: `${start} \u2192 ${end}`,
          why: "Whole surface trip \u2014 stay on bus or walk, not Tube.",
          caption: `Showing bus/walk between ${start} and ${end}. Do not use Tube entrances for this short local hop.`,
          from: start,
          to: end,
          mode: "transit",
          url: option.mapUrl || option.waypointMapUrl
        }),
        stage({
          id: "full",
          label: "2. Walk option",
          hint: "Pedestrian path",
          why: "Same corridor as a walking route, if the distance suits you.",
          caption: `Walk-focused path from ${start} to ${end}.`,
          from: start,
          to: end,
          mode: "walking",
          url: option.waypointMapUrl || option.finalLegMapUrl || option.mapUrl
        }),
        stage({
          id: "final",
          label: "3. Arrival area",
          hint: end,
          why: `Zoom toward ${end} on the surface.`,
          caption: `Arrival area around ${end}.`,
          from: end,
          to: end,
          mode: "walking",
          url: option.finalLegMapUrl || option.mapUrl
        })
      ].filter((item) => item.url || item.from && item.to);
    }
    const accessFirst = Boolean(policy.originRerouteRequired || policy.destinationTransferRequired);
    if (!accessFirst) {
      return [
        stage({
          id: "full",
          label: "1. Whole journey",
          hint: `${start} \u2192 ${end}`,
          why: "End-to-end route when both stations are street-to-train step-free.",
          caption: `Full planned route from ${start} to ${end}.`,
          from: start,
          to: end,
          mode: "transit",
          url: option.mapUrl
        }),
        stage({
          id: "via",
          label: "2. Backup hubs",
          hint: "If lifts fail",
          why: "Same corridor with accessible hubs marked for Plan B.",
          caption: `Same corridor with accessible hub waypoints for Plan B if lifts fail.`,
          from: origin,
          to: destination,
          mode: "transit",
          url: option.waypointMapUrl || option.mapUrl
        }),
        stage({
          id: "final",
          label: "3. Arrival area",
          hint: end,
          why: `Zoom toward ${end}.`,
          caption: `Arrival area around ${end}.`,
          from: end,
          to: end,
          mode: "transit",
          url: option.finalLegMapUrl || option.mapUrl
        })
      ].filter((item) => item.url || item.from && item.to);
    }
    const stages = [
      stage({
        id: "via",
        label: policy.originRerouteRequired ? "1. Tube (after bus)" : "1. Step-free Tube",
        hint: `${origin} \u2192 ${destination}`,
        why: policy.originRerouteRequired ? `First take bus/walk to ${origin}, then this Tube map runs ${origin} \u2192 ${destination}.` : `Tube/rail core from ${origin} to ${destination}.`,
        caption: [
          `This map is the Tube core only: ${origin} \u2192 ${destination}.`,
          policy.originRerouteRequired ? `Before this map: bus or short walk from ${start} to ${origin}.` : `You can begin rail at ${start}.`,
          policy.destinationTransferRequired ? `After this map: leave at ${destination} and take a bus/walk to ${end}.` : `Finish at ${end}.`
        ].join(" "),
        from: origin,
        to: destination,
        mode: "transit",
        url: option.mapUrl || option.waypointMapUrl
      })
    ];
    if (policy.destinationTransferRequired) {
      stages.push(stage({
        id: "final",
        label: "2. Bus finish",
        hint: `${destination} \u2192 ${end}`,
        why: `Leave the Tube at ${destination}, then bus or short walk to ${end}.`,
        caption: `This map is the bus/walk finish only: ${destination} \u2192 ${end}. ${end} is not street-to-train step-free \u2014 do not stay on the Tube into ${end} for street access.`,
        from: destination,
        to: end,
        mode: "walking",
        url: option.finalLegMapUrl || option.mapUrl
      }));
    } else if (policy.originRerouteRequired) {
      stages.push(stage({
        id: "final",
        label: "2. Arrival",
        hint: end,
        why: `Arrive at fully accessible ${end}.`,
        caption: `Arrival at fully accessible ${end} after starting via hub ${origin}.`,
        from: origin,
        to: end,
        mode: "transit",
        url: option.finalLegMapUrl || option.mapUrl
      }));
    } else {
      stages.push(stage({
        id: "full",
        label: "2. Hubs overview",
        hint: `${origin} \u2192 ${destination}`,
        why: "Wider overview of the accessible hubs only.",
        caption: `Overview between accessible hubs only (${origin} \u2192 ${destination}).`,
        from: origin,
        to: destination,
        mode: "transit",
        url: option.waypointMapUrl || option.mapUrl
      }));
    }
    return stages.filter((item) => item.url || item.from && item.to);
  };
  var buildMapHowto = (stages = []) => stages.map((item, index) => `${index + 1}. ${String(item.label).replace(/^\d+\.\s*/, "")}: ${item.why || item.caption}`);
  var buildMapLegend = ({
    start,
    end,
    policy = {},
    originHub = "",
    destinationHub = "",
    startAccessibility = "",
    endAccessibility = ""
  }) => {
    if (policy.preferSurfaceRoute) {
      return [
        { tone: "start", label: `From: ${start}`, note: `${startAccessibility || "Origin"} \xB7 surface` },
        { tone: "end", label: `To: ${end}`, note: `${endAccessibility || "Destination"} \xB7 surface` }
      ];
    }
    const origin = shortHub(originHub);
    const destination = shortHub(destinationHub);
    const items = [
      { tone: "start", label: `From: ${start}`, note: startAccessibility || "Selected origin" }
    ];
    if (policy.originRerouteRequired) {
      items.push({ tone: "hub", label: `Join Tube: ${origin}`, note: "Bus/walk here first" });
    }
    if (policy.destinationTransferRequired) {
      items.push({ tone: "hub", label: `Leave Tube: ${destination}`, note: "Then bus/walk" });
    }
    items.push({
      tone: "end",
      label: `To: ${end}`,
      note: endAccessibility || "Selected destination"
    });
    return items;
  };

  // js/modules/confidenceEngine.js
  var CERTAINTY = {
    high: { level: "high", label: "High certainty", className: "certainty-high" },
    medium: { level: "medium", label: "Check carefully", className: "certainty-medium" },
    low: { level: "low", label: "Needs contingency", className: "certainty-low" }
  };
  var levelCertainty = (accessibility) => {
    if (accessibility === "Full") return CERTAINTY.high;
    if (accessibility === "Interchange" || accessibility === "Partial") return CERTAINTY.medium;
    return CERTAINTY.low;
  };
  var liftHitsStation = (liftMessages = [], stationName = "") => {
    const target = String(stationName || "").trim();
    if (!target) return false;
    return liftMessages.some((message) => {
      const text = String(message || "");
      if (!text) return false;
      const normalise = (value) => String(value).toLowerCase().replace(/['’]/g, "").replace(/\bstation\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
      const left = normalise(text);
      const right = normalise(target);
      if (!left || !right) return false;
      if (left === right) return true;
      const padded = ` ${left} `;
      return padded.includes(` ${right} `);
    });
  };
  var buildConfidenceReport = ({
    start,
    end,
    startAccessibility,
    endAccessibility,
    planA,
    planB,
    liveContext = {},
    profile = {}
  }) => {
    const base = scoreJourneyAccess(startAccessibility, endAccessibility);
    let score = base.score;
    const why = [];
    const liftMessages = (liveContext.liftMessages || []).slice();
    const disrupted = (liveContext.disruptedLines || []).length > 0;
    if (disrupted) {
      score -= 18;
      why.push("Live lift disruption reported on this corridor.");
    } else if (!liveContext.degraded) {
      why.push("No matching lift disruptions found for this corridor right now.");
    }
    if (profile.wheelchair && (startAccessibility !== "Full" || endAccessibility !== "Full")) {
      score -= 12;
      why.push("Wheelchair profile: one or both stations are not fully street-to-platform step-free.");
    }
    if (profile.rampNeeded) {
      score -= 4;
      why.push("Boarding ramp flagged \u2014 ask staff at departure and arrival.");
    }
    if (profile.noEscalators) {
      why.push("No-escalator preference noted \u2014 prefer lift-signed routes and surface options where ranked higher.");
    }
    const walkSteps = (planA?.steps || []).filter((step) => step.type === "walk");
    const estimatedWalk = walkSteps.length * 4;
    if (estimatedWalk > (profile.maxWalkMins || 10)) {
      score -= 8;
      why.push(`Walking segments may exceed your ${profile.maxWalkMins} minute preference.`);
    }
    if (planA?.tflCorrected) {
      score += 2;
      why.push("Free Flow corrected TfL street-access gaps with accessible hubs before ranking Plan A.");
    } else if (planA?.tflLive && planA?.freeflowVerified) {
      score += 4;
      why.push("Plan A uses live TfL timing where published street-to-train access agrees.");
    } else if (planA?.freeflowVerified) {
      score += 3;
      why.push("Plan A is Free Flow verified against published station accessibility (not TfL labels alone).");
    } else if (planA?.tflLive) {
      why.push("Live TfL journey present \u2014 still cross-check street access; TfL step-free is not street-to-train truth.");
    } else {
      why.push("Plan A uses published station access guidance (live TfL journey not available).");
    }
    if (profile.wheelchair && (startAccessibility === "Interchange" || endAccessibility === "Interchange")) {
      why.push("Wheelchair profile: interchange-only stations are treated as street-constrained until confirmed Full.");
    }
    score = Math.max(12, Math.min(99, Math.round(score)));
    let grade = "Constrained";
    if (score >= 90) grade = "Excellent";
    else if (score >= 75) grade = "Strong";
    else if (score >= 55) grade = "Plan carefully";
    const summary = why[0] || base.summary;
    const scoredSteps = (planA?.steps || []).map((step, index) => {
      let certainty = CERTAINTY.high;
      if (step.type === "walk" || step.type === "bus") {
        certainty = profile.wheelchair ? CERTAINTY.medium : CERTAINTY.high;
      }
      if (index === 0) {
        const startCert = levelCertainty(startAccessibility);
        if (startCert.level === "low") certainty = CERTAINTY.low;
        else if (startCert.level === "medium" && certainty.level === "high") certainty = CERTAINTY.medium;
        if (liftHitsStation(liftMessages, start)) certainty = CERTAINTY.low;
      }
      if (index === planA.steps.length - 1) {
        const endCert = levelCertainty(endAccessibility);
        if (endCert.level === "low") certainty = CERTAINTY.low;
        else if (endCert.level === "medium" && certainty.level === "high") certainty = CERTAINTY.medium;
        if (liftHitsStation(liftMessages, end)) certainty = CERTAINTY.low;
      }
      if (disrupted && step.type === "tube") {
        if (certainty.level === "high") certainty = CERTAINTY.medium;
      }
      return {
        ...step,
        certainty
      };
    });
    const assistanceStations = [];
    if (startAccessibility !== "Full" || profile.rampNeeded || profile.wheelchair) {
      assistanceStations.push({
        station: start,
        reason: startAccessibility === "Full" ? "Boarding ramp / staff help requested in your profile." : `${getAccessMeta(startAccessibility).label} \u2014 staff help may be needed.`
      });
    }
    if (endAccessibility !== "Full" || profile.rampNeeded || profile.wheelchair) {
      assistanceStations.push({
        station: end,
        reason: endAccessibility === "Full" ? "Arrival assistance may help with alighting." : `${getAccessMeta(endAccessibility).label} \u2014 plan assistance at arrival.`
      });
    }
    const coach = {
      now: [],
      atStation: [],
      ifFails: []
    };
    coach.now.push(`Travel from ${start} to ${end} using Plan A (${planA?.title || "recommended route"}).`);
    if (planA?.durationMins) {
      coach.now.push(`Allow about ${planA.durationMins} minutes, with ${planA.interchangeCount ?? 0} interchange(s).`);
    }
    coach.atStation.push("Follow signed step-free / lift routes and ask staff for a boarding ramp if you need one.");
    if (liftMessages.length) {
      coach.atStation.push(...liftMessages.slice(0, 2));
    }
    if (planB) {
      coach.ifFails.push(`Switch to Plan B: ${planB.title}. ${planB.rationale || ""}`.trim());
    } else {
      coach.ifFails.push("If lifts fail, leave at the nearest full step-free station and finish by accessible bus.");
    }
    coach.ifFails.push("Re-check TfL lift status before you leave home and again at the ticket hall.");
    return {
      score,
      grade,
      summary,
      why,
      profileLine: profileSummary(profile),
      scoredSteps,
      assistanceStations,
      coach,
      startMeta: getAccessMeta(startAccessibility),
      endMeta: getAccessMeta(endAccessibility)
    };
  };
  var buildAssistanceBriefing = ({ start, end, confidence, planA, planB }) => {
    const stations = (confidence.assistanceStations || []).map((item) => `- ${item.station}: ${item.reason}`).join("\n") || "- No specific assistance stations flagged.";
    return [
      "Free Flow Routes \u2014 assistance briefing",
      `Journey: ${start} \u2192 ${end}`,
      `Access confidence: ${confidence.score} (${confidence.grade})`,
      `Profile: ${confidence.profileLine}`,
      `Plan A: ${planA?.title || "Recommended"} \u2014 ${planA?.rationale || ""}`,
      planB ? `Plan B (if lifts fail): ${planB.title}` : "",
      "Stations that may need staff help:",
      stations,
      "Links: TfL staff help https://tfl.gov.uk/transport-accessibility/help-from-staff",
      "Passenger Assist https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/",
      "Always re-check live lift status with TfL before travel."
    ].filter(Boolean).join("\n");
  };

  // js/modules/urlState.js
  var FLAG_KEYS = {
    wheelchair: "wheelchair",
    noEscalators: "noEscalators",
    ramp: "ramp",
    stepFree: "stepFree",
    plan: "plan"
  };
  var normaliseStationKey2 = (value = "") => String(value).toLowerCase().replace(/['’]/g, "").replace(/\bstation\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  var resolveStationName = (query, stationData = {}) => {
    const typed = String(query || "").trim();
    if (!typed || !stationData || typeof stationData !== "object") return "";
    if (stationData[typed]) return typed;
    const key = normaliseStationKey2(typed);
    if (!key) return "";
    const match = Object.keys(stationData).find((name) => normaliseStationKey2(name) === key);
    return match || "";
  };
  var readFlag = (params, key) => {
    const raw = params.get(key);
    return raw === "1" || raw === "true" || raw === "yes";
  };
  var readPlannerUrl = (stationData = {}, search = window.location.search) => {
    const params = new URLSearchParams(search);
    const hasProfileHints = ["wheelchair", "noEscalators", "ramp", "walk"].some((key) => params.has(key));
    const walkRaw = Number(params.get("walk"));
    const profile = hasProfileHints ? {
      wheelchair: readFlag(params, FLAG_KEYS.wheelchair),
      noEscalators: readFlag(params, FLAG_KEYS.noEscalators),
      rampNeeded: readFlag(params, FLAG_KEYS.ramp),
      maxWalkMins: Number.isFinite(walkRaw) && walkRaw > 0 ? walkRaw : void 0
    } : null;
    return {
      from: resolveStationName(params.get("from") || "", stationData),
      to: resolveStationName(params.get("to") || "", stationData),
      profile,
      stepFree: params.has(FLAG_KEYS.stepFree) ? readFlag(params, FLAG_KEYS.stepFree) : null,
      plan: readFlag(params, FLAG_KEYS.plan) || Boolean(params.get("from") && params.get("to")),
      hasQuery: Boolean(params.toString())
    };
  };
  var writePlannerUrl = ({
    from = "",
    to = "",
    profile = {},
    stepFree = false,
    plan = false
  } = {}, { replace = true } = {}) => {
    if (typeof window === "undefined" || !window.history?.replaceState) return;
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (profile.wheelchair) params.set(FLAG_KEYS.wheelchair, "1");
    if (profile.noEscalators) params.set(FLAG_KEYS.noEscalators, "1");
    if (profile.rampNeeded) params.set(FLAG_KEYS.ramp, "1");
    if (profile.maxWalkMins && Number(profile.maxWalkMins) !== 10) {
      params.set("walk", String(profile.maxWalkMins));
    }
    if (stepFree) params.set(FLAG_KEYS.stepFree, "1");
    if (plan && from && to) params.set(FLAG_KEYS.plan, "1");
    try {
      const nextUrl = new URL(window.location.href);
      nextUrl.search = params.toString();
      if (nextUrl.href === window.location.href) return;
      if (replace) {
        window.history.replaceState({ freeflow: true }, "", nextUrl.href);
      } else {
        window.history.pushState({ freeflow: true }, "", nextUrl.href);
      }
    } catch (error) {
    }
  };
  var clearPlannerUrl = () => {
    if (typeof window === "undefined" || !window.history?.replaceState) return;
    try {
      const nextUrl = new URL(window.location.href);
      nextUrl.search = "";
      if (nextUrl.href === window.location.href) return;
      window.history.replaceState({ freeflow: true }, "", nextUrl.href);
    } catch (error) {
    }
  };

  // js/tfl.js
  var stationService = new StationService();
  var mapService = new MapService();
  var loadingSpinner = document.getElementById("loading-spinner");
  var startStationSelect = document.getElementById("start-station");
  var endStationSelect = document.getElementById("end-station");
  var mapContainer = document.getElementById("map-container");
  var overlay = document.getElementById("overlay");
  var backToTopButton = document.getElementById("back-to-top");
  var routeRecommendation = document.getElementById("route-recommendation");
  var routeMeta = document.getElementById("route-meta");
  var scenarioFired = document.getElementById("scenario-fired");
  var journeyQuickSummary = document.getElementById("journey-quick-summary");
  var accessibilityGuidance = document.getElementById("accessibility-guidance");
  var stationBreakdownContainer = document.getElementById("station-breakdown");
  var liftStatusContainer = document.getElementById("lift-status");
  var liveDeparturesContainer = document.getElementById("live-departures");
  var assistancePanel = document.getElementById("assistance-panel");
  var mapPreviewControls = document.getElementById("map-preview-controls");
  var mapElement = document.getElementById("map");
  var mapStageCaption = document.getElementById("map-stage-caption");
  var mapLegend = document.getElementById("map-legend");
  var mapHowto = document.getElementById("map-howto");
  var mapHowtoList = document.getElementById("map-howto-list");
  var mapStageActive = document.getElementById("map-stage-active");
  var liveConditions = document.getElementById("live-conditions");
  var journeyCard = document.getElementById("journey-summary");
  var accessScoreEl = document.getElementById("access-score");
  var journeyTimelineEl = document.getElementById("journey-timeline");
  var recentListEl = document.getElementById("recent-journeys");
  var exampleChipHost = document.getElementById("example-journeys");
  var stepFreeFilter = document.getElementById("step-free-filter");
  var swapButton = document.getElementById("swap-stations");
  var copyJourneyButton = document.getElementById("copy-journey");
  var copyAssistanceButton = document.getElementById("copy-assistance");
  var printJourneyButton = document.getElementById("print-journey");
  var degradedBanner = document.getElementById("degraded-banner");
  var coachPanel = document.getElementById("coach-panel");
  var planAPanel = document.getElementById("plan-a-panel");
  var planBPanel = document.getElementById("plan-b-panel");
  var RECENT_KEY = "freeflow_recent_journeys";
  var listenersInitialized = false;
  var currentMapUrls = { full: "", via: "", final: "" };
  var currentMapStages = [];
  var startCombobox;
  var endCombobox;
  var latestJourneyText = "";
  var latestAssistanceText = "";
  var latestPlanContext = null;
  var currentProfile = loadAccessProfile();
  var escapeHtml = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  var getFilterMode = () => stepFreeFilter?.checked ? "step-free" : "all";
  var getStationList = () => Object.entries(stationService.stationData).map(([name, accessibility]) => ({ name, accessibility })).sort((a, b) => a.name.localeCompare(b.name));
  var setJourneyActive = (isActive) => {
    if (!journeyCard) return;
    journeyCard.classList.toggle("is-active", isActive);
    journeyCard.classList.toggle("is-empty", !isActive);
  };
  var persistProfileFromForm = () => {
    currentProfile = saveAccessProfile(readProfileFromForm());
    return currentProfile;
  };
  var syncUrlFromUi = ({ plan = false, replace = true } = {}) => {
    const start = startCombobox?.getValue() || startStationSelect?.value || "";
    const end = endCombobox?.getValue() || endStationSelect?.value || "";
    writePlannerUrl({
      from: start,
      to: end,
      profile: currentProfile,
      stepFree: Boolean(stepFreeFilter?.checked),
      plan: plan && Boolean(start && end)
    }, { replace });
  };
  var renderGuidanceList = (guidance) => {
    if (!accessibilityGuidance) return;
    accessibilityGuidance.innerHTML = "";
    guidance.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      accessibilityGuidance.appendChild(listItem);
    });
  };
  var renderDegradedBanner = (recommendations) => {
    if (!degradedBanner) return;
    const trustCopy = trustBannerCopy(recommendations.trust);
    const parts = [];
    if (recommendations.degraded) {
      parts.push(`
            <details class="banner-fold">
                <summary><strong>Live TfL data is not active</strong> \u2014 showing published-access guidance</summary>
                <p>Add a TfL app key for higher rate limits on live rail timing and lift disruptions.</p>
            </details>
        `);
    }
    if (trustCopy) {
      parts.push(`
            <details class="banner-fold">
                <summary><strong>${escapeHtml(trustCopy.title)}</strong></summary>
                <p>${escapeHtml(trustCopy.body)}</p>
                <ul>${trustCopy.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </details>
        `);
    }
    if (!parts.length) {
      degradedBanner.hidden = true;
      degradedBanner.textContent = "";
      degradedBanner.classList.remove("trust-banner", "is-corrected");
      return;
    }
    degradedBanner.hidden = false;
    degradedBanner.classList.toggle("trust-banner", Boolean(trustCopy));
    degradedBanner.classList.toggle("is-corrected", Boolean(trustCopy));
    degradedBanner.innerHTML = parts.join("");
  };
  var getBaseGuidance = (start, end, startAccessibility, endAccessibility, policy = {}) => {
    const guidance = buildJourneyGuidance(start, end, startAccessibility, endAccessibility, policy);
    routeRecommendation.textContent = guidance.headline;
    return guidance.items;
  };
  var renderConfidenceHero = (confidence) => {
    if (!accessScoreEl) return;
    accessScoreEl.hidden = false;
    accessScoreEl.innerHTML = `
        <div class="score-ring" aria-hidden="true"><span>${confidence.score}</span></div>
        <div class="score-copy">
            <p class="score-eyebrow">Access confidence</p>
            <p class="score-grade">${escapeHtml(confidence.grade)}</p>
            <p>${escapeHtml(confidence.summary)}</p>
            <p class="score-profile">Profile: ${escapeHtml(confidence.profileLine)}</p>
        </div>
    `;
    accessScoreEl.dataset.grade = confidence.grade.toLowerCase().replace(/\s+/g, "-");
  };
  var renderCoach = (confidence) => {
    if (!coachPanel) return;
    coachPanel.hidden = false;
    coachPanel.innerHTML = `
        <h3 class="panel-title">Do this now</h3>
        <ul class="coach-list">${confidence.coach.now.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3 class="panel-title">At the station</h3>
        <ul class="coach-list">${confidence.coach.atStation.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3 class="panel-title">If lifts fail</h3>
        <ul class="coach-list">${confidence.coach.ifFails.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    `;
  };
  var renderPlanCard = (container, plan, label, confidenceSteps = null) => {
    if (!container) return;
    if (!plan) {
      container.innerHTML = "";
      return;
    }
    const duration = typeof plan.durationMins === "number" ? `${plan.durationMins} mins` : "Time varies";
    const changes = typeof plan.interchangeCount === "number" ? `${plan.interchangeCount} change${plan.interchangeCount === 1 ? "" : "s"}` : "Changes vary";
    const modeSet = [...new Set((plan.steps || []).map((step) => step.type).filter(Boolean))];
    const stepsHtml = (confidenceSteps || plan.steps || []).map((step, index) => {
      const certainty = step.certainty ? `<span class="certainty-chip ${step.certainty.className}">${escapeHtml(step.certainty.label)}</span>` : "";
      return `<li class="plan-step plan-step-${escapeHtml(step.type || "step")}">
            <span class="step-type step-type-${escapeHtml(step.type || "step")}">${escapeHtml(step.type || "step")}</span>
            <span class="step-copy">${escapeHtml(step.text)}</span>
            ${certainty}
            ${step.durationMins ? `<em>${escapeHtml(String(step.durationMins))} min</em>` : ""}
            <span class="visually-hidden">Leg ${index + 1}</span>
        </li>`;
    }).join("");
    container.innerHTML = `
        <div class="plan-panel-header">
            <p class="plan-label">${escapeHtml(label)}</p>
            <h3>${escapeHtml(plan.title)}</h3>
            <p>${escapeHtml(plan.rationale || "")}</p>
            <div class="plan-metrics">
                <span>${escapeHtml(duration)}</span>
                <span>${escapeHtml(changes)}</span>
                <span>${escapeHtml(plan.badge || "Route")}</span>
            </div>
            <div class="mode-chip-row">${modeSet.map((mode) => `<span class="mode-chip mode-chip-${escapeHtml(mode)}">${escapeHtml(mode)}</span>`).join("")}</div>
        </div>
        <ol class="route-step-list plan-step-list">${stepsHtml}</ol>
    `;
  };
  var renderJourneyQuickSummary = (start, end, confidence, planA) => {
    if (!journeyQuickSummary) return;
    const duration = planA?.durationMins ? `About ${planA.durationMins} minutes` : "";
    journeyQuickSummary.innerHTML = `
        <p class="journey-pair">${escapeHtml(start)} <span aria-hidden="true">\u2192</span> ${escapeHtml(end)}</p>
        <p class="journey-scoreline">${escapeHtml([duration, confidence.profileLine].filter(Boolean).join(" \xB7 "))}</p>
    `;
  };
  var applyMapPreview = (previewMode) => {
    const stage2 = currentMapStages.find((item) => item.id === previewMode) || currentMapStages[0];
    if (!stage2) return;
    mapService.showStage(stage2);
    if (mapStageCaption) mapStageCaption.textContent = stage2.caption;
    if (mapStageActive) {
      mapStageActive.hidden = false;
      mapStageActive.textContent = `Now showing: ${stage2.label} \u2014 ${stage2.why || stage2.hint}`;
    }
    if (mapElement) mapElement.setAttribute("aria-label", `Route map: ${stage2.label} \u2014 ${stage2.hint}`);
  };
  var renderMapLegend = (items = []) => {
    if (!mapLegend) return;
    if (!items.length) {
      mapLegend.innerHTML = "";
      return;
    }
    mapLegend.innerHTML = items.map((item) => `
        <div class="map-legend-item map-legend-${escapeHtml(item.tone)}">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.note)}</span>
        </div>
    `).join("");
  };
  var getPreferredPreviewMode = (option, policy = {}) => {
    if (policy.preferSurfaceRoute || option?.surfaceRoute) return "via";
    if (policy.originRerouteRequired || policy.destinationTransferRequired) return "via";
    if (option?.id && (option.id.includes("hub") || option.id.includes("transfer") || option.contingency)) {
      return "via";
    }
    return "full";
  };
  var renderLearningPanel = (recommendations, start, end) => {
    const panel = document.getElementById("learning-panel");
    if (!panel) return;
    const learned = recommendations.learning || memorySummary(loadRouteMemory());
    panel.hidden = false;
    panel.innerHTML = `
        <h3 class="panel-title">Help Free Flow learn</h3>
        <p class="learning-summary">${escapeHtml(learned.line || "No lessons stored on this device yet.")}</p>
        <p class="learning-hint">Your feedback stays on this device and improves later plans for similar corridors.</p>
        <div class="learning-actions">
            <button type="button" class="ghost-button" data-feedback="helpful">This plan helped</button>
            <button type="button" class="ghost-button" data-feedback="prefer-surface">Should be bus / walk</button>
            <button type="button" class="ghost-button" data-feedback="wrong-hub">Wrong hub / Tube detour</button>
        </div>
        <p id="learning-status" class="learning-status" aria-live="polite"></p>
    `;
    panel.querySelectorAll("[data-feedback]").forEach((button) => {
      button.addEventListener("click", () => {
        const feedback = button.getAttribute("data-feedback");
        const memory = learnFromFeedback({
          start,
          end,
          feedback,
          liveContext: recommendations.liveContext || {}
        });
        const status = panel.querySelector("#learning-status");
        const summary = memorySummary(memory);
        if (status) {
          status.textContent = feedback === "helpful" ? `Thanks \u2014 noted. ${summary.line}` : `Learned for next time. ${summary.line}`;
        }
        const summaryEl = panel.querySelector(".learning-summary");
        if (summaryEl) summaryEl.textContent = summary.line;
      });
    });
  };
  var renderMapPreviewControls = (option, context = {}) => {
    if (!mapPreviewControls || !option) return;
    const {
      preferredPreview = "full",
      start = "",
      end = "",
      policy = {},
      originHub = "",
      destinationHub = "",
      startAccessibility = "",
      endAccessibility = ""
    } = context;
    currentMapStages = buildMapStages({
      option,
      start,
      end,
      policy,
      originHub,
      destinationHub
    });
    currentMapUrls = {
      full: option.mapUrl,
      via: option.waypointMapUrl || option.mapUrl,
      final: option.finalLegMapUrl || option.mapUrl
    };
    renderMapLegend(buildMapLegend({
      start,
      end,
      policy,
      originHub,
      destinationHub,
      startAccessibility,
      endAccessibility
    }));
    if (mapHowto && mapHowtoList) {
      const howto = buildMapHowto(currentMapStages);
      mapHowtoList.innerHTML = howto.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
      mapHowto.hidden = howto.length === 0;
    }
    mapPreviewControls.innerHTML = "";
    const preferred = currentMapStages.some((stage2) => stage2.id === preferredPreview) ? preferredPreview : currentMapStages[0]?.id || "full";
    currentMapStages.forEach((stage2, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "map-preview-button";
      button.dataset.preview = stage2.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", stage2.id === preferred ? "true" : "false");
      button.innerHTML = `
            <span class="map-stage-index">${index + 1}</span>
            <span class="map-stage-copy">
                <strong>${escapeHtml(stage2.label)}</strong>
                <em>${escapeHtml(stage2.hint)}</em>
            </span>
        `;
      button.addEventListener("click", () => {
        mapPreviewControls.querySelectorAll(".map-preview-button").forEach((item) => {
          item.classList.remove("active");
          item.setAttribute("aria-selected", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        applyMapPreview(stage2.id);
      });
      if (stage2.id === preferred) button.classList.add("active");
      mapPreviewControls.appendChild(button);
    });
    applyMapPreview(preferred);
  };
  var renderStationBreakdown = (stationBreakdown = []) => {
    if (!stationBreakdownContainer) return;
    stationBreakdownContainer.innerHTML = "";
    if (!stationBreakdown.length) return;
    const heading = document.createElement("h3");
    heading.className = "panel-title";
    heading.textContent = "Station access detail";
    stationBreakdownContainer.appendChild(heading);
    stationBreakdown.forEach((entry) => {
      const level = stationService.stationData[entry.station] || "Unknown";
      const meta = getAccessMeta(level);
      const card = document.createElement("div");
      card.className = "station-breakdown-card";
      card.innerHTML = `
            <div class="station-card-top">
                <h3>${escapeHtml(entry.station)}</h3>
                <span class="access-chip ${meta.className}">${escapeHtml(meta.label)}</span>
            </div>
            <p>${escapeHtml(entry.summary)}</p>
            <ul>${entry.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}</ul>
        `;
      stationBreakdownContainer.appendChild(card);
    });
  };
  var renderLiveDepartures = (departures = [], isLive = false) => {
    if (!liveDeparturesContainer) return;
    liveDeparturesContainer.innerHTML = "";
    if (!isLive || !departures.length) {
      const empty = document.createElement("p");
      empty.className = "panel-note";
      empty.textContent = "Live departures unavailable \u2014 open TfL Go or station boards for times on the day.";
      liveDeparturesContainer.appendChild(empty);
      return;
    }
    const note = document.createElement("p");
    note.className = "panel-note";
    note.textContent = "Live arrivals from TfL \u2014 always confirm on the day.";
    liveDeparturesContainer.appendChild(note);
    const list = document.createElement("ul");
    list.className = "departure-list";
    departures.forEach((item) => {
      const row = document.createElement("li");
      row.innerHTML = `<strong>${escapeHtml(item.line)}</strong><span>to ${escapeHtml(item.destination)}</span><em>${escapeHtml(String(item.dueInMins))} min</em>`;
      list.appendChild(row);
    });
    liveDeparturesContainer.appendChild(list);
  };
  var showLiveConditions = (visible) => {
    if (liveConditions) liveConditions.hidden = !visible;
  };
  var renderLiftStatus = (liveContext = {}) => {
    if (!liftStatusContainer) return;
    const liftChecks = liveContext.liftChecks || {};
    const liftMessages = liveContext.liftMessages || [];
    const hasChecks = Boolean(liftChecks.start || liftChecks.end || liftChecks.interchange);
    liftStatusContainer.innerHTML = "";
    if (!hasChecks) {
      showLiveConditions(false);
      return;
    }
    showLiveConditions(true);
    const list = document.createElement("ul");
    list.className = "lift-check-list";
    [
      ["Start", liftChecks.start],
      ["End", liftChecks.end],
      ["Interchange", liftChecks.interchange]
    ].forEach(([role, check]) => {
      if (!check) return;
      const item = document.createElement("li");
      item.className = `lift-check lift-${check.state || "unknown"}`;
      const detail = check.detail || "";
      item.title = detail;
      item.innerHTML = `
            <div class="lift-check-top">
                <strong>${escapeHtml(role)}: ${escapeHtml(check.station || "Station")}</strong>
                <span class="lift-state-chip">${escapeHtml(check.label || "Unknown")}</span>
            </div>
            <p>${escapeHtml(detail)}</p>
        `;
      list.appendChild(item);
    });
    liftStatusContainer.appendChild(list);
    if (liftMessages.length) {
      const msgHeading = document.createElement("h4");
      msgHeading.className = "lift-message-heading";
      msgHeading.textContent = "TfL lift notices";
      liftStatusContainer.appendChild(msgHeading);
      const messages = document.createElement("ul");
      messages.className = "lift-message-list";
      liftMessages.forEach((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        messages.appendChild(item);
      });
      liftStatusContainer.appendChild(messages);
    }
  };
  var renderAssistancePanel = (start, end, confidence) => {
    if (!assistancePanel) return;
    const stations = confidence.assistanceStations || [];
    assistancePanel.innerHTML = `
        <h3 class="panel-title">Assistance pack</h3>
        <p>Take this briefing to staff or Passenger Assist.</p>
        <ul class="assistance-station-list">
            ${stations.length ? stations.map((item) => `<li><strong>${escapeHtml(item.station)}</strong> \u2014 ${escapeHtml(item.reason)}</li>`).join("") : "<li>No specific assistance stations flagged for this profile.</li>"}
        </ul>
        <p><a href="https://tfl.gov.uk/transport-accessibility/help-from-staff" target="_blank" rel="noopener noreferrer">TfL staff assistance</a></p>
        <p><a href="https://www.nationalrail.co.uk/help-and-assistance/passenger-assist/" target="_blank" rel="noopener noreferrer">Book Passenger Assist</a></p>
        <p><strong>Planned journey:</strong> ${escapeHtml(start)} to ${escapeHtml(end)}</p>
        <p class="panel-note">Use \u201CCopy assistance pack\u201D above for a shareable text version.</p>
    `;
  };
  var displayAccessibilityInfo = (start, end) => {
    const startAccessibility = stationService.stationData[start] || "N/A";
    const endAccessibility = stationService.stationData[end] || "N/A";
    startCombobox?.updateBadge(startAccessibility);
    endCombobox?.updateBadge(endAccessibility);
  };
  var readRecent = () => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch (error) {
      return [];
    }
  };
  var saveRecent = (start, end) => {
    const next = [{ start, end }, ...readRecent().filter((item) => !(item.start === start && item.end === end))].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    renderRecent();
  };
  var applyJourneyPair = (start, end) => {
    startCombobox?.setValue(start);
    endCombobox?.setValue(end);
  };
  var renderRecent = () => {
    if (!recentListEl) return;
    const recent = readRecent().filter((item) => stationService.stationData[item.start] && stationService.stationData[item.end]);
    recentListEl.innerHTML = "";
    if (!recent.length) {
      recentListEl.hidden = true;
      return;
    }
    recentListEl.hidden = false;
    const label = document.createElement("p");
    label.className = "chip-label";
    label.textContent = "Recent journeys";
    recentListEl.appendChild(label);
    recent.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "journey-chip";
      button.textContent = `${item.start} \u2192 ${item.end}`;
      button.addEventListener("click", () => {
        applyJourneyPair(item.start, item.end);
        planRoute();
      });
      recentListEl.appendChild(button);
    });
  };
  var renderExamples = () => {
    if (!exampleChipHost) return;
    exampleChipHost.innerHTML = "";
    const label = document.createElement("p");
    label.className = "chip-label";
    label.textContent = "Try a Full step-free pair";
    exampleChipHost.appendChild(label);
    buildExampleJourneys(stationService.stationData, 4).forEach((item) => {
      if (!stationService.stationData[item.start] || !stationService.stationData[item.end]) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "journey-chip";
      button.textContent = `${item.start} \u2192 ${item.end}`;
      button.addEventListener("click", () => {
        applyJourneyPair(item.start, item.end);
        planRoute();
      });
      exampleChipHost.appendChild(button);
    });
  };
  var buildShareText = (start, end, confidence, planA, planB) => {
    latestJourneyText = [
      `Free Flow Routes: ${start} \u2192 ${end}`,
      `Access confidence: ${confidence.score} (${confidence.grade})`,
      confidence.summary,
      `Plan A: ${planA?.title || ""}`,
      ...(confidence.scoredSteps || []).map((step, index) => `${index + 1}. [${step.certainty?.label || "step"}] ${step.text}`),
      planB ? `Plan B if lifts fail: ${planB.title}` : "",
      "Always re-check live lift status with TfL before travel."
    ].filter(Boolean).join("\n");
    latestAssistanceText = buildAssistanceBriefing({ start, end, confidence, planA, planB });
  };
  var hideOverlay = () => overlay.classList.add("hidden");
  var resetSelections = () => {
    startCombobox?.clear();
    endCombobox?.clear();
    startStationSelect.selectedIndex = 0;
    endStationSelect.selectedIndex = 0;
    if (accessScoreEl) {
      accessScoreEl.hidden = true;
      accessScoreEl.innerHTML = "";
    }
    if (journeyTimelineEl) journeyTimelineEl.innerHTML = "";
    if (coachPanel) {
      coachPanel.hidden = true;
      coachPanel.innerHTML = "";
    }
    if (planAPanel) planAPanel.innerHTML = "";
    if (planBPanel) planBPanel.innerHTML = "";
    if (degradedBanner) {
      degradedBanner.hidden = true;
      degradedBanner.textContent = "";
    }
    if (journeyQuickSummary) {
      journeyQuickSummary.innerHTML = "<p>Set your profile, choose two stations, and get Plan A with certainty on every leg \u2014 plus Plan B if lifts fail.</p>";
    }
    if (scenarioFired) scenarioFired.textContent = "";
    routeRecommendation.textContent = "Your guidance will appear here after you plan a route.";
    routeMeta.textContent = "";
    accessibilityGuidance.innerHTML = "";
    stationBreakdownContainer.innerHTML = "";
    if (liftStatusContainer) {
      liftStatusContainer.innerHTML = "";
    }
    if (liveDeparturesContainer) liveDeparturesContainer.innerHTML = "";
    if (liveConditions) liveConditions.hidden = true;
    assistancePanel.innerHTML = "";
    mapPreviewControls.innerHTML = "";
    if (mapLegend) mapLegend.innerHTML = "";
    if (mapHowto) mapHowto.hidden = true;
    if (mapHowtoList) mapHowtoList.innerHTML = "";
    if (mapStageActive) {
      mapStageActive.hidden = true;
      mapStageActive.textContent = "";
    }
    if (mapStageCaption) {
      mapStageCaption.textContent = "Plan a journey to see each access stage on the map.";
    }
    currentMapStages = [];
    mapContainer.style.display = "none";
    overlay.classList.add("hidden");
    latestJourneyText = "";
    latestAssistanceText = "";
    latestPlanContext = null;
    const learningPanel = document.getElementById("learning-panel");
    if (learningPanel) {
      learningPanel.hidden = true;
      learningPanel.innerHTML = "";
    }
    setJourneyActive(false);
    mapService.reset();
    stationService.reset();
    clearPlannerUrl();
  };
  var planRoute = async () => {
    const start = startCombobox?.getValue() || startStationSelect.value;
    const end = endCombobox?.getValue() || endStationSelect.value;
    if (!stationService.validateRouteSelection(start, end)) return;
    const profile = persistProfileFromForm();
    const startAccessibility = stationService.stationData[start] || "N/A";
    const endAccessibility = stationService.stationData[end] || "N/A";
    displayAccessibilityInfo(start, end);
    try {
      const recommendations = await buildDynamicRecommendations({
        apiKey: API_KEY,
        start,
        end,
        startAccessibility,
        endAccessibility,
        profile
      });
      const planA = recommendations.planA || recommendations.recommended;
      const planB = recommendations.planB || recommendations.alternatives[0] || null;
      const confidence = buildConfidenceReport({
        start,
        end,
        startAccessibility,
        endAccessibility,
        planA,
        planB,
        liveContext: recommendations.liveContext,
        profile
      });
      const hasLiveJourney = (recommendations.liveContext?.journeyStrategies || []).length > 0;
      const confidenceLabel = recommendations.policy?.preferSurfaceRoute ? "Surface-first local link (bus / walk)" : recommendations.trust?.differsFromTfl ? "Free Flow corrected street access (ahead of TfL labels)" : recommendations.degraded ? "Fallback guidance (no live TfL journey)" : hasLiveJourney ? "Live TfL timing + Free Flow access gate" : "Free Flow published-access guidance";
      setJourneyActive(true);
      latestPlanContext = { start, end, recommendations };
      renderDegradedBanner(recommendations);
      renderConfidenceHero(confidence);
      renderJourneyQuickSummary(start, end, confidence, planA);
      renderCoach(confidence);
      renderPlanCard(planAPanel, planA, "Plan A \u2014 Free Flow recommended", confidence.scoredSteps);
      renderPlanCard(planBPanel, planB, "Plan B \u2014 if lifts fail");
      renderLearningPanel(recommendations, start, end);
      if (scenarioFired) {
        const notes = [];
        if (recommendations.policy?.preferSurfaceRoute) notes.push("surface-first");
        else if (recommendations.trust?.differsFromTfl) notes.push("TfL corrected");
        scenarioFired.textContent = `${startAccessibility} \u2192 ${endAccessibility}${notes.length ? ` \xB7 ${notes.join(" \xB7 ")}` : ""}`;
      }
      routeMeta.textContent = `${confidenceLabel} \xB7 Selected: ${planA?.title || "Plan A"}`;
      const strictPolicyGuidance = [];
      if (recommendations.policy?.preferSurfaceRoute) {
        strictPolicyGuidance.push(`Surface-first: ${start} and ${end} are local and not street-to-train step-free \u2014 use bus or walk.`);
      }
      if (recommendations.policy?.originRerouteRequired) {
        strictPolicyGuidance.push(`Origin reroute: start via ${recommendations.liveContext.originHub || "an accessible hub"} before joining the Tube.`);
      }
      if (recommendations.policy?.destinationTransferRequired) {
        strictPolicyGuidance.push(`Bus finish required: leave rail at ${recommendations.liveContext.destinationHub || "an accessible interchange"} and take a bus or short walk to ${end}. Do not rely on street access at ${end}.`);
      }
      renderGuidanceList([
        ...getBaseGuidance(start, end, startAccessibility, endAccessibility, recommendations.policy || {}),
        ...strictPolicyGuidance,
        ...confidence.why.slice(0, 3)
      ]);
      renderStationBreakdown(recommendations.liveContext.stationBreakdown || []);
      renderLiftStatus(recommendations.liveContext || {});
      renderLiveDepartures(
        recommendations.liveContext.liveDepartures || [],
        Boolean(recommendations.liveContext.departuresAreLive)
      );
      renderAssistancePanel(start, end, confidence);
      const preferredPreview = getPreferredPreviewMode(planA, recommendations.policy || {});
      renderMapPreviewControls(planA, {
        preferredPreview,
        start,
        end,
        policy: recommendations.policy || {},
        originHub: recommendations.liveContext?.originHub || "",
        destinationHub: recommendations.liveContext?.destinationHub || "",
        startAccessibility,
        endAccessibility
      });
      mapContainer.style.display = "block";
      overlay.classList.add("hidden");
      saveRecent(start, end);
      buildShareText(start, end, confidence, planA, planB);
      syncUrlFromUi({ plan: true, replace: true });
      journeyCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      handleError(error, ErrorTypes.NETWORK);
    }
  };
  var setupComboboxes = () => {
    const stations = getStationList();
    startCombobox = new StationCombobox({
      input: document.getElementById("start-station-input"),
      listbox: document.getElementById("start-station-listbox"),
      select: startStationSelect,
      badge: document.getElementById("start-accessibility"),
      stations,
      getFilterMode,
      onChange: () => {
      }
    });
    endCombobox = new StationCombobox({
      input: document.getElementById("end-station-input"),
      listbox: document.getElementById("end-station-listbox"),
      select: endStationSelect,
      badge: document.getElementById("end-accessibility"),
      stations,
      getFilterMode,
      onChange: () => {
      }
    });
  };
  var setupProfileListeners = () => {
    writeProfileToForm(currentProfile);
    ["profile-wheelchair", "profile-no-escalators", "profile-ramp", "profile-max-walk"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", () => {
        persistProfileFromForm();
        syncUrlFromUi({ plan: Boolean(latestPlanContext) });
      });
    });
  };
  var applyUrlState = (state, { autoPlan = false } = {}) => {
    if (!state) return false;
    if (state.profile) {
      currentProfile = saveAccessProfile({
        wheelchair: Boolean(state.profile.wheelchair),
        noEscalators: Boolean(state.profile.noEscalators),
        rampNeeded: Boolean(state.profile.rampNeeded),
        maxWalkMins: state.profile.maxWalkMins || currentProfile.maxWalkMins || 10
      });
      writeProfileToForm(currentProfile);
    }
    if (stepFreeFilter && state.stepFree !== null && state.stepFree !== void 0) {
      stepFreeFilter.checked = Boolean(state.stepFree);
    }
    if (state.from || state.to) {
      applyJourneyPair(state.from || "", state.to || "");
    }
    if (autoPlan && state.plan && state.from && state.to) {
      planRoute();
      return true;
    }
    if (state.from || state.to || state.profile || state.stepFree) {
      syncUrlFromUi({ plan: false });
    }
    return false;
  };
  var restoreFromUrl = () => {
    const state = readPlannerUrl(stationService.stationData);
    if (!state.hasQuery) return;
    applyUrlState(state, { autoPlan: true });
  };
  var setupEventListeners = () => {
    if (listenersInitialized) return;
    document.getElementById("plan-route").addEventListener("click", (event) => {
      event.preventDefault();
      planRoute();
    });
    document.getElementById("reset-button").addEventListener("click", resetSelections);
    overlay.addEventListener("click", hideOverlay);
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        hideOverlay();
      }
    });
    swapButton?.addEventListener("click", () => {
      const start = startCombobox?.getValue() || "";
      const end = endCombobox?.getValue() || "";
      applyJourneyPair(end, start);
      syncUrlFromUi({ plan: Boolean(latestPlanContext && end && start) });
    });
    stepFreeFilter?.addEventListener("change", () => {
      startCombobox?.renderOptions(document.getElementById("start-station-input").value);
      endCombobox?.renderOptions(document.getElementById("end-station-input").value);
      syncUrlFromUi({ plan: Boolean(latestPlanContext) });
    });
    copyJourneyButton?.addEventListener("click", async () => {
      if (!latestJourneyText) return;
      try {
        await navigator.clipboard.writeText(latestJourneyText);
        copyJourneyButton.textContent = "Copied";
        setTimeout(() => {
          copyJourneyButton.textContent = "Copy plan";
        }, 1600);
      } catch (error) {
        handleError(error, ErrorTypes.NETWORK);
      }
    });
    copyAssistanceButton?.addEventListener("click", async () => {
      if (!latestAssistanceText) return;
      try {
        await navigator.clipboard.writeText(latestAssistanceText);
        copyAssistanceButton.textContent = "Copied pack";
        setTimeout(() => {
          copyAssistanceButton.textContent = "Copy assistance pack";
        }, 1600);
      } catch (error) {
        handleError(error, ErrorTypes.NETWORK);
      }
    });
    printJourneyButton?.addEventListener("click", () => window.print());
    document.getElementById("planner-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      planRoute();
    });
    window.addEventListener("popstate", () => {
      const state = readPlannerUrl(stationService.stationData);
      if (!state.from && !state.to) {
        resetSelections();
        return;
      }
      applyUrlState(state, { autoPlan: true });
    });
    setupProfileListeners();
    listenersInitialized = true;
  };
  var fetchTFL = async () => {
    setupEventListeners();
    loadingSpinner.style.display = "block";
    try {
      await stationService.fetchStationData();
      stationService.populateDropdowns();
      setupComboboxes();
      renderExamples();
      renderRecent();
      await mapService.initialize(
        document.getElementById("map"),
        document.getElementById("open-external-map")
      );
      restoreFromUrl();
    } catch (error) {
      alert(`Failed to load station data. Error: ${error.message}`);
    } finally {
      loadingSpinner.style.display = "none";
    }
  };
  var initializeBackToTop = () => {
    const onScroll = () => {
      if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 200) {
        backToTopButton.style.display = "block";
      } else {
        backToTopButton.style.display = "none";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    backToTopButton.addEventListener("click", function() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };
  var initialize = async () => {
    if (window.__freeflowInitialized) return;
    window.__freeflowInitialized = true;
    initializeDarkMode();
    initializeBackToTop();
    setJourneyActive(false);
    await fetchTFL();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
