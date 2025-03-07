import { create } from 'zustand';

type RoutePreference = 'best' | 'fewer_transfers' | 'less_walking';

interface Journey {
  startStation: string | null;
  endStation: string | null;
  routeDetails: RouteDetail[] | null;
  duration: number | null;
  distance: number | null;
  steps: number | null;
}

interface RouteDetail {
  mode: string;
  line?: string;
  fromStation: string;
  toStation: string;
  duration: number;
  stepFree: boolean;
}

interface JourneyState {
  // Journey data
  currentJourney: Journey | null;
  journeyHistory: Journey[];
  
  // Preferences
  routePreference: RoutePreference;
  showAccessibility: boolean;
  
  // Actions
  setRoutePreference: (pref: RoutePreference) => void;
  setShowAccessibility: (show: boolean) => void;
  planJourney: (start: string, end: string, preference: RoutePreference) => Promise<void>;
  resetJourney: () => void;
  saveJourneyToHistory: (journey: Journey) => void;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  // Initial state
  currentJourney: null,
  journeyHistory: [],
  routePreference: 'best',
  showAccessibility: true,
  
  // Actions
  setRoutePreference: (pref) => set({ routePreference: pref }),
  
  setShowAccessibility: (show) => set({ showAccessibility: show }),
  
  planJourney: async (start, end, preference) => {
    // In a real app, this would call an API
    // Simulating API call for demo purposes
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate route data
    const mockRouteDetails: RouteDetail[] = [
      {
        mode: 'tube',
        line: 'Jubilee',
        fromStation: start,
        toStation: 'Westminster',
        duration: 12,
        stepFree: true
      },
      {
        mode: 'walk',
        fromStation: 'Westminster',
        toStation: 'St. James Park',
        duration: 8,
        stepFree: true
      },
      {
        mode: 'tube',
        line: 'District',
        fromStation: 'St. James Park',
        toStation: end,
        duration: 6,
        stepFree: preference === 'less_walking' ? true : false
      }
    ];
    
    const journey: Journey = {
      startStation: start,
      endStation: end,
      routeDetails: mockRouteDetails,
      duration: mockRouteDetails.reduce((acc, route) => acc + route.duration, 0),
      distance: 5.2, // miles or km
      steps: preference === 'less_walking' ? 450 : 1200
    };
    
    set({ currentJourney: journey });
    get().saveJourneyToHistory(journey);
  },
  
  resetJourney: () => set({ currentJourney: null }),
  
  saveJourneyToHistory: (journey) => {
    set(state => ({
      journeyHistory: [journey, ...state.journeyHistory].slice(0, 10) // Keep only last 10 journeys
    }));
  }
})); 