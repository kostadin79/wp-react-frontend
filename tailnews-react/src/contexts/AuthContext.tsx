'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI, AuthAPIError } from '@/lib/auth-api';
import { 
  AuthState, 
  AuthContextType, 
  LoginCredentials, 
  RegisterData, 
  User 
} from '@/types/auth';

// Auth reducer types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; refreshToken?: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'USER_UPDATE'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      };

    case 'USER_UPDATE':
      return {
        ...state,
        user: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const authResponse = await authAPI.login(credentials);
      
      // Store tokens and user data
      authAPI.storeToken(authResponse.token, authResponse.refreshToken);
      authAPI.storeUser(authResponse.user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: authResponse.user,
          token: authResponse.token,
          refreshToken: authResponse.refreshToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof AuthAPIError 
        ? error.message 
        : 'Login failed. Please try again.';
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const authResponse = await authAPI.register(data);
      
      // Store tokens and user data
      authAPI.storeToken(authResponse.token, authResponse.refreshToken);
      authAPI.storeUser(authResponse.user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: authResponse.user,
          token: authResponse.token,
          refreshToken: authResponse.refreshToken,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof AuthAPIError 
        ? error.message 
        : 'Registration failed. Please try again.';
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authAPI.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async () => {
    const refreshToken = authAPI.getStoredRefreshToken();
    
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const authResponse = await authAPI.refreshToken(refreshToken);
      
      authAPI.storeToken(authResponse.token, authResponse.refreshToken);
      authAPI.storeUser(authResponse.user);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: authResponse.user,
          token: authResponse.token,
          refreshToken: authResponse.refreshToken,
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [logout]);

  // Update user profile
  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!state.user || !state.token) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedUser = await authAPI.updateUser(state.token, state.user.id, userData);
      authAPI.storeUser(updatedUser);
      dispatch({ type: 'USER_UPDATE', payload: updatedUser });
    } catch (error) {
      const errorMessage = error instanceof AuthAPIError 
        ? error.message 
        : 'Failed to update user profile.';
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.user, state.token]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    dispatch({ type: 'AUTH_START' });
    
    const token = authAPI.getStoredToken();
    const storedUser = authAPI.getStoredUser();
    
    if (!token || !storedUser) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }

    // Check if token is expired
    if (authAPI.isTokenExpired(token)) {
      await refreshAuth();
      return;
    }

    try {
      // Validate token with server
      const user = await authAPI.validateToken(token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user,
          token,
          refreshToken: authAPI.getStoredRefreshToken() || undefined,
        },
      });
    } catch (error) {
      console.error('Token validation failed:', error);
      await refreshAuth();
    }
  }, [refreshAuth]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.token || !state.isAuthenticated) return;

    const decoded = authAPI.decodeToken(state.token);
    if (!decoded) return;

    // Refresh token 5 minutes before expiration
    const refreshTime = (decoded.exp * 1000) - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      const timeout = setTimeout(() => {
        refreshAuth();
      }, refreshTime);

      return () => clearTimeout(timeout);
    }
  }, [state.token, state.isAuthenticated, refreshAuth]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timeout = setTimeout(() => {
        dispatch({ type: 'CLEAR_ERROR' });
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [state.error]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to access this page.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Log In
            </a>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Hook for checking permissions
export function usePermissions() {
  const { user } = useAuth();

  const hasRole = useCallback((role: string): boolean => {
    return user ? authAPI.hasRole(user, role) : false;
  }, [user]);

  const hasCapability = useCallback((capability: string): boolean => {
    return user ? authAPI.hasCapability(user, capability) : false;
  }, [user]);

  const canEdit = useCallback((resourceUserId?: number): boolean => {
    if (!user) return false;
    
    // User can edit their own content
    if (resourceUserId && resourceUserId === user.id) return true;
    
    // Or if they have edit_others_posts capability
    return hasCapability('edit_others_posts');
  }, [user, hasCapability]);

  const canDelete = useCallback((resourceUserId?: number): boolean => {
    if (!user) return false;
    
    // User can delete their own content
    if (resourceUserId && resourceUserId === user.id) return true;
    
    // Or if they have delete_others_posts capability
    return hasCapability('delete_others_posts');
  }, [user, hasCapability]);

  return {
    hasRole,
    hasCapability,
    canEdit,
    canDelete,
    isAdmin: hasRole('administrator'),
    isEditor: hasRole('editor'),
    isAuthor: hasRole('author'),
  };
}