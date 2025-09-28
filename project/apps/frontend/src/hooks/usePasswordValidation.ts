import { useSystemSettings } from './useSystemSettings';
import { useTranslations } from 'next-intl';

export function usePasswordValidation() {
  const { data: settings } = useSystemSettings();
  const t = useTranslations('auth');

  const validatePassword = (password: string): string | null => {
    const minLength = settings?.passwordMinLength || 8;

    if (password.length < minLength) {
      return t('passwordMinLength', { minLength });
    }

    if (!/[A-Z]/.test(password)) {
      return t('passwordUppercase');
    }

    if (!/[a-z]/.test(password)) {
      return t('passwordLowercase');
    }

    if (!/\d/.test(password)) {
      return t('passwordNumber');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return t('passwordSpecial');
    }

    return null;
  };

  const getPasswordRequirements = (): string[] => {
    const minLength = settings?.passwordMinLength || 8;
    return [
      t('passwordMinLength', { minLength }),
      t('passwordUppercase'),
      t('passwordLowercase'),
      t('passwordNumber'),
      t('passwordSpecial'),
    ];
  };

  return {
    validatePassword,
    getPasswordRequirements,
    minLength: settings?.passwordMinLength || 8,
  };
}
