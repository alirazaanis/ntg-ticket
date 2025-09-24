import { useSystemSettings } from './useSystemSettings';

export function useAutoAssignSettings() {
  const { data: settings } = useSystemSettings();

  const isAutoAssignEnabled = settings?.autoAssignTickets || false;
  const autoCloseEnabled = settings?.autoCloseResolved || false;
  const autoCloseDays = settings?.autoCloseDays || 7;

  const getAutoAssignMessage = () => {
    if (isAutoAssignEnabled) {
      return 'Tickets will be automatically assigned based on priority and SLA level.';
    }
    return 'Auto-assignment is disabled. Tickets will need to be manually assigned.';
  };

  const getAutoCloseMessage = () => {
    if (autoCloseEnabled) {
      return `Resolved tickets will be automatically closed after ${autoCloseDays} days.`;
    }
    return 'Auto-close is disabled. Resolved tickets will remain open until manually closed.';
  };

  return {
    isAutoAssignEnabled,
    autoCloseEnabled,
    autoCloseDays,
    getAutoAssignMessage,
    getAutoCloseMessage,
  };
}
