import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  TicketFilters,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  SearchCriteria,
  SavedSearch,
} from '../types/unified';

export const useSearch = () => {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<SearchCriteria>({
    search: '',
    status: [],
    priority: [],
    category: [],
    impact: [],
    urgency: [],
    slaLevel: [],
    assignedTo: [],
    requester: [],
    dateFrom: null,
    dateTo: null,
    tags: [],
    customFields: {},
  });

  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load saved searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved-searches');
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
    } catch (error) {}
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const recent = localStorage.getItem('recent-searches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {}
  }, []);

  // Save searches to localStorage
  const saveSearches = useCallback((searches: SavedSearch[]) => {
    try {
      localStorage.setItem('saved-searches', JSON.stringify(searches));
      setSavedSearches(searches);
    } catch (error) {}
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearches = useCallback((searches: string[]) => {
    try {
      localStorage.setItem('recent-searches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (error) {}
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchCriteria>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      category: [],
      impact: [],
      urgency: [],
      slaLevel: [],
      assignedTo: [],
      requester: [],
      dateFrom: null,
      dateTo: null,
      tags: [],
      customFields: {},
    });
  }, []);

  const saveSearch = useCallback(
    (name: string, searchFilters: SearchCriteria) => {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        description: '',
        searchCriteria: JSON.stringify({ ...searchFilters }),
        userId: session?.user?.id || '',
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedSearches = [...savedSearches, newSearch];
      saveSearches(updatedSearches);
      return newSearch;
    },
    [savedSearches, saveSearches, session?.user?.id]
  );

  const deleteSearch = useCallback(
    (searchId: string) => {
      const updatedSearches = savedSearches.filter(s => s.id !== searchId);
      saveSearches(updatedSearches);
    },
    [savedSearches, saveSearches]
  );

  const loadSearch = useCallback((search: SavedSearch) => {
    const searchCriteria = JSON.parse(search.searchCriteria) as SearchCriteria;
    setFilters(searchCriteria);
  }, []);

  const addRecentSearch = useCallback(
    (search: string) => {
      if (!search.trim()) return;

      // Only add to recent searches if it's different from the last search
      const trimmedSearch = search.trim();
      if (recentSearches[0] === trimmedSearch) return;

      const updatedRecent = [
        trimmedSearch,
        ...recentSearches.filter(s => s !== trimmedSearch),
      ].slice(0, 10); // Keep only last 10 searches

      saveRecentSearches(updatedRecent);
    },
    [recentSearches, saveRecentSearches]
  );

  const clearRecentSearches = useCallback(() => {
    saveRecentSearches([]);
  }, [saveRecentSearches]);

  const removeRecentSearch = useCallback(
    (search: string) => {
      const updatedRecent = recentSearches.filter(s => s !== search);
      saveRecentSearches(updatedRecent);
    },
    [recentSearches, saveRecentSearches]
  );

  const getSearchQuery = useCallback(() => {
    const query: Partial<TicketFilters> = {};

    if (filters.search) query.search = filters.search;
    if (filters.status && filters.status.length > 0)
      query.status = filters.status as TicketStatus[];
    if (filters.priority && filters.priority.length > 0)
      query.priority = filters.priority as TicketPriority[];
    if (filters.category && filters.category.length > 0)
      query.category = filters.category as TicketCategory[];
    if (filters.assignedTo && filters.assignedTo.length > 0)
      query.assignedTo = filters.assignedTo[0];
    if (filters.requester && filters.requester.length > 0)
      query.requester = filters.requester[0];
    if (filters.dateFrom) query.dateFrom = filters.dateFrom.toISOString();
    if (filters.dateTo) query.dateTo = filters.dateTo.toISOString();

    return query;
  }, [filters]);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.search ||
      (filters.status && filters.status.length > 0) ||
      (filters.priority && filters.priority.length > 0) ||
      (filters.category && filters.category.length > 0) ||
      (filters.assignedTo && filters.assignedTo.length > 0) ||
      (filters.requester && filters.requester.length > 0) ||
      filters.dateFrom ||
      filters.dateTo ||
      (filters.tags && filters.tags.length > 0)
    );
  }, [filters]);

  return {
    filters,
    savedSearches,
    recentSearches,
    updateFilters,
    clearFilters,
    saveSearch,
    deleteSearch,
    loadSearch,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
    getSearchQuery,
    hasActiveFilters,
  };
};
