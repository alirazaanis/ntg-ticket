'use client';

import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useEffect } from 'react';

export function DynamicMetadata() {
  const { data: settings } = useSystemSettings();

  useEffect(() => {
    if (settings) {
      // Update document title
      document.title = settings.siteName || 'NTG Ticket System';

      // Update meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          'content',
          settings.siteDescription || 'IT Support Ticket Management System'
        );
      }
    }
  }, [settings]);

  return null;
}
