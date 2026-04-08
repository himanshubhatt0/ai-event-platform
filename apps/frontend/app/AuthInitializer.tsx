'use client';

import { ReactNode, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCookie, deleteCookie } from '@/utils/cookies';
import { getMeApi } from '@/services/auth.service';
import { RootState } from '@/redux/store';
import { setToken, setUser, clearAuth } from '@/redux/slices/authSlice';

export default function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const authToken = getCookie('auth_token');

    if (!authToken) {
      return;
    }

    if (!token) {
      dispatch(setToken(authToken));
    }

    if (!user) {
      getMeApi()
        .then((me) => dispatch(setUser(me)))
        .catch(() => {
          dispatch(clearAuth());
          deleteCookie('auth_token');
        });
    }
  }, [dispatch, token, user]);

  return <>{children}</>;
}
