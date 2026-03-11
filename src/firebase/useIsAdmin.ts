"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/firebase';

type UseIsAdminResult = {
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useIsAdmin(): UseIsAdminResult {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      inFlightRef.current = false;
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenResult = await user.getIdTokenResult();
      let admin = tokenResult?.claims?.admin === true;

      // One forced refresh so recently assigned claims are picked up quickly.
      if (!admin) {
        const refreshed = await user.getIdTokenResult(true);
        admin = refreshed?.claims?.admin === true;
      }

      setIsAdmin(admin);
    } catch (e) {
      setError(e as Error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    void refresh();
  }, [isUserLoading, refresh]);

  return { isAdmin, isLoading: isLoading || isUserLoading, error, refresh };
}
