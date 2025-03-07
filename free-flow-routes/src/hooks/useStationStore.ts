import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Station } from '../lib/api/tfl';

interface StationState {
  // Station data
  stations: Station[];
  startStation: string | null;
  endStation: string | null;
  stationsLoading: boolean;
  stationsError: string | null;
  searchQuery: string;
  
  // Actions
  setStations: (stations: Station[]) => void;
  setStartStation: (stationId: string | null) => void;
  setEndStation: (stationId: string | null) => void;
  setStationsLoading: (loading: boolean) => void;
  setStationsError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredStations: () => Station[];
  getStationById: (id: string) => Station | undefined;
}

export const useStationStore = create<StationState>()(
  persist(
    (set, get) => ({
      // Initial state
      stations: [],
      startStation: null,
      endStation: null,
      stationsLoading: false,
      stationsError: null,
      searchQuery: '',
      
      // Actions
      setStations: (stations) => set({ stations }),
      
      setStartStation: (stationId) => set({ startStation: stationId }),
      
      setEndStation: (stationId) => set({ endStation: stationId }),
      
      setStationsLoading: (loading) => set({ stationsLoading: loading }),
      
      setStationsError: (error) => set({ stationsError: error }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      getFilteredStations: () => {
        const { stations, searchQuery } = get();
        
        if (!searchQuery.trim()) {
          return stations;
        }
        
        const query = searchQuery.toLowerCase().trim();
        return stations.filter(station => 
          station.name.toLowerCase().includes(query)
        );
      },
      
      getStationById: (id) => {
        return get().stations.find(station => station.id === id);
      }
    }),
    {
      name: 'station-store', // name of the item in the storage
      partialize: (state) => ({ 
        // Only persist these fields
        startStation: state.startStation,
        endStation: state.endStation
      })
    }
  )
); 