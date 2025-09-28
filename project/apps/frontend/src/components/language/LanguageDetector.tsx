'use client';

import { useEffect } from 'react';

const supportedLocales = ['en', 'ar'];

export function LanguageDetector() {
  useEffect(() => {
    // Check if locale cookie already exists
    const existingLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='))
      ?.split('=')[1];

    if (existingLocale) {
      return; // Cookie already exists, no need to detect
    }

    // Detect language from browser
    const browserLanguage =
      navigator.language || navigator.languages?.[0] || 'en';
    const detectedLocale = browserLanguage.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')

    // Check if detected language is supported
    const locale = supportedLocales.includes(detectedLocale)
      ? detectedLocale
      : 'en';

    // Set the cookie
    document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 year

    // Reload page to apply the detected language
    window.location.reload();
  }, []);

  return null; // This component doesn't render anything
}
