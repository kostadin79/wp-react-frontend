// WordPress Authentication API Client

import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  PasswordResetRequest,
  PasswordResetConfirm,
  AuthError,
  JWTPayload 
} from '@/types/auth';

const AUTH_API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp/v2', '') || 'http://localhost:8000/wp-json';
const JWT_AUTH_ENDPOINT = `${AUTH_API_BASE}/jwt-auth/v1`;
const WP_USERS_ENDPOINT = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/users`;

class AuthAPIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'AuthAPIError';
  }
}

class AuthAPI {
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new AuthAPIError(
          data.message || 'Authentication request failed',
          data.code || 'AUTH_ERROR',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof AuthAPIError) {
        throw error;
      }

      if (error instanceof TypeError) {
        throw new AuthAPIError(
          'Network error - please check your connection',
          'NETWORK_ERROR',
          0
        );
      }

      throw new AuthAPIError(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        500,
        error
      );
    }
  }

  private transformUser(wpUser: any): User {
    return {
      id: wpUser.id,
      username: wpUser.username || wpUser.slug,
      email: wpUser.email,
      firstName: wpUser.first_name || '',
      lastName: wpUser.last_name || '',
      displayName: wpUser.name || wpUser.display_name,
      roles: wpUser.roles || [],
      capabilities: wpUser.capabilities || {},
      avatar: wpUser.avatar_urls?.[96] || wpUser.avatar_urls?.[48] || '',
      description: wpUser.description || '',
      url: wpUser.url || '',
      registeredDate: wpUser.registered_date || new Date().toISOString(),
      meta: wpUser.meta || {},
    };
  }

  // Login with JWT authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<any>(`${JWT_AUTH_ENDPOINT}/token`, {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });

    // Get user details
    const userResponse = await this.makeRequest<any>(`${JWT_AUTH_ENDPOINT}/token/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${response.token}`,
      },
    });

    return {
      token: response.token,
      user: this.transformUser(userResponse.data),
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in || 3600, // Default 1 hour
    };
  }

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    // First create the user
    const userResponse = await this.makeRequest<any>(`${WP_USERS_ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        roles: ['subscriber'], // Default role
      }),
      headers: {
        // Admin authentication required for user creation
        Authorization: `Bearer ${this.getStoredToken()}`,
      },
    });

    // Then login the newly created user
    return this.login({
      username: userData.username,
      password: userData.password,
    });
  }

  // Validate JWT token
  async validateToken(token: string): Promise<User> {
    const response = await this.makeRequest<any>(`${JWT_AUTH_ENDPOINT}/token/validate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return this.transformUser(response.data);
  }

  // Refresh JWT token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.makeRequest<any>(`${JWT_AUTH_ENDPOINT}/token/refresh`, {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    const userResponse = await this.validateToken(response.token);

    return {
      token: response.token,
      user: userResponse,
      refreshToken: response.refresh_token || refreshToken,
      expiresIn: response.expires_in || 3600,
    };
  }

  // Get current user profile
  async getCurrentUser(token: string): Promise<User> {
    return this.validateToken(token);
  }

  // Update user profile
  async updateUser(token: string, userId: number, userData: Partial<User>): Promise<User> {
    const response = await this.makeRequest<any>(`${WP_USERS_ENDPOINT}/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        description: userData.description,
        url: userData.url,
      }),
    });

    return this.transformUser(response);
  }

  // Change password
  async changePassword(
    token: string, 
    userId: number, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    await this.makeRequest(`${WP_USERS_ENDPOINT}/${userId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: newPassword,
        // Note: WordPress doesn't validate current password by default
        // You may need a custom endpoint or plugin for this
      }),
    });
  }

  // Request password reset
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    // This requires a custom WordPress endpoint or plugin
    // Common plugins: WP REST Password Reset, etc.
    await this.makeRequest(`${AUTH_API_BASE}/wp/v2/users/reset-password`, {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
      }),
    });
  }

  // Confirm password reset
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await this.makeRequest(`${AUTH_API_BASE}/wp/v2/users/reset-password/confirm`, {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
        password: data.password,
      }),
    });
  }

  // Logout (client-side token removal)
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }

  // Check if user has specific capability
  hasCapability(user: User, capability: string): boolean {
    return user.capabilities[capability] === true;
  }

  // Check if user has specific role
  hasRole(user: User, role: string): boolean {
    return user.roles.includes(role);
  }

  // Decode JWT token
  decodeToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;

    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // Get stored token from localStorage
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  // Store token in localStorage
  storeToken(token: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Store user data in localStorage
  storeUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  // Get stored user data
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  // Get stored refresh token
  getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();
export { AuthAPIError };