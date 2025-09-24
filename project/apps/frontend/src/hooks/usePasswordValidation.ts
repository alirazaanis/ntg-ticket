import { useSystemSettings } from './useSystemSettings';

export function usePasswordValidation() {
  const { data: settings } = useSystemSettings();

  const validatePassword = (password: string): string | null => {
    const minLength = settings?.passwordMinLength || 8;

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }

    return null;
  };

  const getPasswordRequirements = (): string[] => {
    const minLength = settings?.passwordMinLength || 8;
    return [
      `At least ${minLength} characters long`,
      'At least one uppercase letter',
      'At least one lowercase letter',
      'At least one number',
      'At least one special character',
    ];
  };

  return {
    validatePassword,
    getPasswordRequirements,
    minLength: settings?.passwordMinLength || 8,
  };
}
