'use client';

import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCookie, deleteCookie } from '@/utils/cookies';
import { getMeApi } from '@/services/auth.service';
import { RootState } from '@/redux/store';
import { setToken, setUser, clearAuth } from '@/redux/slices/authSlice';

let meRequestInFlight: Promise<unknown> | null = null;
let meRequestToken: string | null = null;

export default function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthLoading = useSelector((state: RootState) => state.auth.loading);

  useEffect(() => {
    const authToken = getCookie('auth_token');

    if (!authToken) {
      return;
    }

    if (!token) {
      dispatch(setToken(authToken));
    }

    if (user || isAuthLoading) {
      return;
    }

    if (!meRequestInFlight || meRequestToken !== authToken) {
      meRequestToken = authToken;
      meRequestInFlight = getMeApi();
    }

    meRequestInFlight
      .then((me) => dispatch(setUser(me)))
      .catch(() => {
        dispatch(clearAuth());
        deleteCookie('auth_token');
      })
      .finally(() => {
        meRequestInFlight = null;
        meRequestToken = null;
      });
  }, [dispatch, isAuthLoading, token, user]);

  return <>{children}</>;
}
