import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTicketsStore } from '../stores/useTicketsStore';
import { ticketApi } from '../lib/apiClient';
import { Ticket } from '../types/unified';

/**
 * Hook to sync the tickets store with API data
 * This ensures the store is initialized with existing tickets
 * and stays in sync with the backend
 */
export function useTicketsStoreSync() {
  const { data: session, status } = useSession();
  const { setTickets, setLoading } = useTicketsStore();

  useEffect(() => {
    const initializeTickets = async () => {
      if (status === 'authenticated' && session?.accessToken) {
        try {
          setLoading(true);

          // Fetch tickets from API
          const response = await ticketApi.getTickets({
            page: 1,
            limit: 1000, // Get a large number to populate the store
          });

          // Set tickets in store - handle different response structures
          let tickets: Ticket[] = [];
          if (
            response.data?.data?.data &&
            Array.isArray(response.data.data.data)
          ) {
            tickets = response.data.data.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            tickets = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            tickets = response.data;
          }

          setTickets(tickets);
          console.log(
            `Initialized tickets store with ${tickets.length} tickets`
          );
        } catch (error) {
          console.error('Failed to initialize tickets:', error);
          // Don't throw error, just log it - store will remain empty
        } finally {
          setLoading(false);
        }
      }
    };

    initializeTickets();
  }, [status, session?.accessToken, setTickets, setLoading]);

  // Optional: Set up periodic refresh to keep data in sync
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      const interval = setInterval(async () => {
        try {
          const response = await ticketApi.getTickets({
            page: 1,
            limit: 1000,
          });

          // Use the same data structure handling as initial load
          let tickets: Ticket[] = [];
          if (
            response.data?.data?.data &&
            Array.isArray(response.data.data.data)
          ) {
            tickets = response.data.data.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            tickets = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            tickets = response.data;
          }

          setTickets(tickets);
          console.log(`Refreshed tickets store with ${tickets.length} tickets`);
        } catch (error) {
          console.error('Failed to refresh tickets:', error);
          // Don't clear existing tickets on error - keep current state
        }
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [status, session?.accessToken, setTickets]);
}
