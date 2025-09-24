import { useState, useEffect } from 'react';

export function useLoginAttempts() {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  // Default values for login attempts (can be configured later)
  const maxLoginAttempts = 5;

  const checkLoginAttempts = (attempts: number): boolean => {
    return attempts < maxLoginAttempts;
  };

  const getRemainingAttempts = (attempts: number): number => {
    return Math.max(0, maxLoginAttempts - attempts);
  };

  // Load attempts from localStorage on mount
  useEffect(() => {
    const savedAttempts = localStorage.getItem('login-attempts');
    const savedLockoutTime = localStorage.getItem('login-lockout-time');

    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }

    if (savedLockoutTime) {
      const lockout = new Date(savedLockoutTime);
      if (lockout > new Date()) {
        setIsLocked(true);
        setLockoutTime(lockout);
      } else {
        // Lockout expired, reset attempts
        resetAttempts();
      }
    }
  }, []);

  const incrementAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('login-attempts', newAttempts.toString());

    if (newAttempts >= maxLoginAttempts) {
      const lockout = new Date();
      lockout.setMinutes(lockout.getMinutes() + 15); // 15 minute lockout
      setLockoutTime(lockout);
      setIsLocked(true);
      localStorage.setItem('login-lockout-time', lockout.toISOString());
    }
  };

  const resetAttempts = () => {
    setAttempts(0);
    setIsLocked(false);
    setLockoutTime(null);
    localStorage.removeItem('login-attempts');
    localStorage.removeItem('login-lockout-time');
  };

  const canAttemptLogin = () => {
    if (isLocked && lockoutTime && lockoutTime > new Date()) {
      return false;
    }
    return checkLoginAttempts(attempts);
  };

  const getRemainingTime = () => {
    if (!isLocked || !lockoutTime) return 0;
    const now = new Date();
    const diff = lockoutTime.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / 1000)); // seconds
  };

  const formatRemainingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    attempts,
    isLocked,
    lockoutTime,
    maxLoginAttempts,
    remainingAttempts: getRemainingAttempts(attempts),
    canAttemptLogin: canAttemptLogin(),
    remainingTime: getRemainingTime(),
    formattedRemainingTime: formatRemainingTime(getRemainingTime()),
    incrementAttempts,
    resetAttempts,
  };
}
