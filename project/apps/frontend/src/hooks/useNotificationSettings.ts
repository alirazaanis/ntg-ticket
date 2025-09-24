import { useSystemSettings } from './useSystemSettings';
import { useEffect } from 'react';

export function useNotificationSettings() {
  const { data: settings } = useSystemSettings();

  const emailNotifications = settings?.emailNotifications || false;
  const pushNotifications = settings?.pushNotifications || false;
  const smsNotifications = settings?.smsNotifications || false;
  const notificationFrequency = settings?.notificationFrequency || 'immediate';

  // Request notification permission if push notifications are enabled
  useEffect(() => {
    if (pushNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [pushNotifications]);

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!pushNotifications || !('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    }

    return false;
  };

  const canShowPushNotification = () => {
    return (
      pushNotifications &&
      'Notification' in window &&
      Notification.permission === 'granted'
    );
  };

  const getNotificationMessage = () => {
    const methods = [];
    if (emailNotifications) methods.push('email');
    if (pushNotifications) methods.push('push notifications');
    if (smsNotifications) methods.push('SMS');

    if (methods.length === 0) {
      return 'Notifications are disabled';
    }

    return `Notifications enabled via ${methods.join(', ')}`;
  };

  return {
    emailNotifications,
    pushNotifications,
    smsNotifications,
    notificationFrequency,
    showNotification,
    canShowPushNotification,
    getNotificationMessage,
  };
}
