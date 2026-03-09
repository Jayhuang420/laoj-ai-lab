import { useState, useCallback } from 'react';

const TOKEN_KEY = 'laoj_admin_token';

export function useAdminApi() {
  const [token, setToken] = useState(sessionStorage.getItem(TOKEN_KEY) || '');

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: '登入失敗' }));
      throw new Error(data.error || '登入失敗');
    }
    const data = await res.json();
    sessionStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    return data;
  };

  const logout = useCallback(() => {
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    sessionStorage.removeItem(TOKEN_KEY);
    setToken('');
  }, [token]);

  const api = useCallback(
    async (path: string, opts?: RequestInit) => {
      const res = await fetch(path, {
        ...opts,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...opts?.headers,
        },
      });
      // Auto-logout on 401 (session expired or server restarted)
      if (res.status === 401 && path !== '/api/auth/login') {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken('');
      }
      return res;
    },
    [token],
  );

  return { token, login, logout, api };
}
