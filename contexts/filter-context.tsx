"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SortOption = "name-asc" | "name-desc" | "date-asc" | "date-desc";

export interface FilterState {
  // Common filters
  searchQuery: string;
  sortBy: SortOption;
  
  // Programs filters
  programsWithHost: boolean;
  programsWithoutHost: boolean;
  
  // People filters
  peopleWithTelegram: boolean;
  peopleWithoutTelegram: boolean;
  
  // Recordings filters
  recordingType: "all" | "live" | "podcast";
  recordingStatus: "all" | "published" | "hidden";
  selectedGenres: string[];
  selectedPrograms: string[];
  
  // Genres filters (minimal, just search)
}

interface FilterContextType {
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  searchQuery: "",
  sortBy: "date-desc",
  programsWithHost: false,
  programsWithoutHost: false,
  peopleWithTelegram: false,
  peopleWithoutTelegram: false,
  recordingType: "all",
  recordingStatus: "all",
  selectedGenres: [],
  selectedPrograms: [],
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = "radioznb-filters";

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFilters({ ...defaultFilters, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load filters from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
      } catch (error) {
        console.error("Failed to save filters to localStorage:", error);
      }
    }
  }, [filters, isHydrated]);

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}

