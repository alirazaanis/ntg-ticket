'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

export function useRTL() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;

    // Update body direction for better RTL support
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL, locale]);

  return {
    locale,
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
  };
}
