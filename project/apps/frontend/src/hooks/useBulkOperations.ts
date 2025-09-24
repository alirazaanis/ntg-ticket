import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { ticketApi } from '../lib/apiClient';
import { BulkUpdateData, TicketPriority } from '../types/unified';

export const useBulkOperations = () => {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectTicket = useCallback((ticketId: string) => {
    setSelectedTickets(prev => [...prev, ticketId]);
  }, []);

  const deselectTicket = useCallback((ticketId: string) => {
    setSelectedTickets(prev => prev.filter(id => id !== ticketId));
  }, []);

  const toggleTicket = useCallback((ticketId: string) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  }, []);

  const selectAll = useCallback((ticketIds: string[]) => {
    setSelectedTickets(ticketIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTickets([]);
  }, []);

  const isSelected = useCallback(
    (ticketId: string) => {
      return selectedTickets.includes(ticketId);
    },
    [selectedTickets]
  );

  const isAllSelected = useCallback(
    (ticketIds: string[]) => {
      return (
        ticketIds.length > 0 &&
        ticketIds.every(id => selectedTickets.includes(id))
      );
    },
    [selectedTickets]
  );

  const isIndeterminate = useCallback(
    (ticketIds: string[]) => {
      const selectedCount = ticketIds.filter(id =>
        selectedTickets.includes(id)
      ).length;
      return selectedCount > 0 && selectedCount < ticketIds.length;
    },
    [selectedTickets]
  );

  const bulkUpdate = useCallback(
    async (action: string, data: BulkUpdateData) => {
      if (selectedTickets.length === 0) return;

      setIsProcessing(true);

      try {
        const promises = selectedTickets.map(ticketId => {
          switch (action) {
            case 'status':
              return ticketApi.updateStatus(
                ticketId,
                (data as { status: string; note?: string }).status,
                (data as { status: string; note?: string }).note
              );

            case 'assign':
              return ticketApi.assignTicket(
                ticketId,
                (data as { assignedToId: string }).assignedToId
              );

            case 'priority':
              return ticketApi.updateTicket(ticketId, {
                priority: (data as { priority: TicketPriority }).priority,
              });

            case 'delete':
              return ticketApi.deleteTicket(ticketId);

            case 'notify':
              // This would need to be implemented in the backend
              return ticketApi.updateTicket(ticketId, {
                // Add notification logic here
              });

            default:
              throw new Error(`Unknown bulk action: ${action}`);
          }
        });

        const results = await Promise.allSettled(promises);
        const successful = results.filter(
          result => result.status === 'fulfilled'
        ).length;
        const failed = results.filter(
          result => result.status === 'rejected'
        ).length;

        if (successful > 0) {
          notifications.show({
            title: 'Bulk Operation Successful',
            message: `${successful} tickets updated successfully`,
            color: 'green',
          });
        }

        if (failed > 0) {
          notifications.show({
            title: 'Some Operations Failed',
            message: `${failed} tickets could not be updated`,
            color: 'orange',
          });
        }

        // Clear selection after successful operations
        if (action !== 'notify') {
          clearSelection();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        notifications.show({
          title: 'Bulk Operation Failed',
          message:
            'An error occurred while processing the bulk operation' +
            errorMessage,
          color: 'red',
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [selectedTickets, clearSelection]
  );

  return {
    selectedTickets,
    isProcessing,
    selectTicket,
    deselectTicket,
    toggleTicket,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    bulkUpdate,
  };
};
