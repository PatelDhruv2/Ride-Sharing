import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(redirectTo = '/Signin') {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Function to fetch user data from cookies via API
    async function fetchUser() {
      try {
        // First try to get from API (which uses cookies)
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setLoading(false);
          return;
        }

        // If API fails, try localStorage as fallback (browser only)
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('jwtToken');
          const storedUser = localStorage.getItem('user');
          
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else if (redirectTo) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [redirectTo, router]);

  // Function to get authentication header for API requests
  const getAuthHeader = () => {
    if (typeof window !== 'undefined' && localStorage.getItem('jwtToken')) {
      return { Authorization: `Bearer ${localStorage.getItem('jwtToken')}` };
    }
    return {};
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('user');
    }
    
    // Also clear the cookie by making a request to a logout API route
    fetch('/api/auth/logout', { method: 'POST' })
      .finally(() => {
        setUser(null);
        setToken('');
        router.push(redirectTo);
      });
  };

  return {
    user,
    loading,
    token,
    getAuthHeader,
    logout,
    isAuthenticated: !!user
  };
} 