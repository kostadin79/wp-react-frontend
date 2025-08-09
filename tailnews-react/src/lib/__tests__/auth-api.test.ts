import { authAPI, AuthAPIError } from '../auth-api';
import { server } from '@/test/utils/msw-server';
import { http, HttpResponse } from 'msw';

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

describe('AuthAPI', () => {
  describe('login', () => {
    it('successfully logs in with valid credentials', async () => {
      const credentials = { username: 'testuser', password: 'password' };
      
      const response = await authAPI.login(credentials);

      expect(response).toMatchObject({
        token: 'mock-jwt-token',
        user: {
          id: expect.any(Number),
          username: 'testuser',
          email: 'test@example.com',
          displayName: 'Test User',
        },
      });
    });

    it('throws error with invalid credentials', async () => {
      const credentials = { username: 'testuser', password: 'wrongpassword' };

      await expect(authAPI.login(credentials)).rejects.toThrow(AuthAPIError);
    });

    it('handles network errors', async () => {
      // Mock network failure
      server.use(
        http.post('*/jwt-auth/v1/token', () => {
          throw new Error('Network error');
        })
      );

      const credentials = { username: 'testuser', password: 'password' };

      await expect(authAPI.login(credentials)).rejects.toThrow('Network error');
    });
  });

  describe('validateToken', () => {
    it('validates valid token', async () => {
      const token = 'mock-jwt-token';
      
      const user = await authAPI.validateToken(token);

      expect(user).toMatchObject({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
    });

    it('throws error for invalid token', async () => {
      const token = 'invalid-token';

      // Mock invalid token response
      server.use(
        http.post('*/jwt-auth/v1/token/validate', () => {
          return new HttpResponse(null, {
            status: 401,
            statusText: 'Unauthorized',
          });
        })
      );

      await expect(authAPI.validateToken(token)).rejects.toThrow(AuthAPIError);
    });
  });

  describe('token management', () => {
    it('stores token in localStorage', () => {
      const token = 'test-token';
      const refreshToken = 'test-refresh-token';

      authAPI.storeToken(token, refreshToken);

      expect(localStorage.getItem('auth_token')).toBe(token);
      expect(localStorage.getItem('refresh_token')).toBe(refreshToken);
    });

    it('retrieves stored token', () => {
      const token = 'test-token';
      localStorage.setItem('auth_token', token);

      const retrievedToken = authAPI.getStoredToken();
      expect(retrievedToken).toBe(token);
    });

    it('clears tokens on logout', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('refresh_token', 'test-refresh-token');
      localStorage.setItem('user_data', JSON.stringify({ id: 1 }));

      authAPI.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('user management', () => {
    it('stores user data', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        roles: ['subscriber'],
        capabilities: {},
        avatar: '',
        registeredDate: '2023-01-01',
      };

      authAPI.storeUser(user);

      const storedUser = authAPI.getStoredUser();
      expect(storedUser).toEqual(user);
    });

    it('handles invalid stored user data', () => {
      localStorage.setItem('user_data', 'invalid-json');

      const user = authAPI.getStoredUser();
      expect(user).toBeNull();
    });
  });

  describe('JWT token utilities', () => {
    it('decodes valid JWT token', () => {
      // Create a mock JWT token (header.payload.signature)
      const payload = {
        iss: 'http://localhost:8000',
        iat: 1640995200,
        nbf: 1640995200,
        exp: 1640998800,
        data: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            roles: ['subscriber'],
          },
        },
      };

      const base64Payload = btoa(JSON.stringify(payload));
      const mockToken = `header.${base64Payload}.signature`;

      const decoded = authAPI.decodeToken(mockToken);
      expect(decoded).toEqual(payload);
    });

    it('handles invalid JWT token', () => {
      const invalidToken = 'invalid.token';

      const decoded = authAPI.decodeToken(invalidToken);
      expect(decoded).toBeNull();
    });

    it('checks token expiration', () => {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Expired token
      const expiredPayload = {
        exp: currentTime - 3600, // 1 hour ago
        data: { user: { id: 1 } },
      };
      const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      
      expect(authAPI.isTokenExpired(expiredToken)).toBe(true);

      // Valid token
      const validPayload = {
        exp: currentTime + 3600, // 1 hour from now
        data: { user: { id: 1 } },
      };
      const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
      
      expect(authAPI.isTokenExpired(validToken)).toBe(false);
    });
  });

  describe('permission helpers', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      displayName: 'Test User',
      roles: ['author', 'subscriber'],
      capabilities: {
        read: true,
        edit_posts: true,
        publish_posts: false,
      },
      avatar: '',
      registeredDate: '2023-01-01',
    };

    it('checks user capabilities', () => {
      expect(authAPI.hasCapability(mockUser, 'read')).toBe(true);
      expect(authAPI.hasCapability(mockUser, 'edit_posts')).toBe(true);
      expect(authAPI.hasCapability(mockUser, 'publish_posts')).toBe(false);
      expect(authAPI.hasCapability(mockUser, 'delete_posts')).toBe(false);
    });

    it('checks user roles', () => {
      expect(authAPI.hasRole(mockUser, 'author')).toBe(true);
      expect(authAPI.hasRole(mockUser, 'subscriber')).toBe(true);
      expect(authAPI.hasRole(mockUser, 'administrator')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('creates AuthAPIError correctly', () => {
      const error = new AuthAPIError('Test error', 'TEST_ERROR', 400, { detail: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(400);
      expect(error.data).toEqual({ detail: 'test' });
      expect(error.name).toBe('AuthAPIError');
    });

    it('handles API error responses', async () => {
      // Mock error response
      server.use(
        http.post('*/jwt-auth/v1/token', () => {
          return HttpResponse.json(
            {
              code: 'invalid_credentials',
              message: 'Invalid username or password',
            },
            { status: 401 }
          );
        })
      );

      const credentials = { username: 'testuser', password: 'wrongpassword' };

      try {
        await authAPI.login(credentials);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthAPIError);
        expect((error as AuthAPIError).code).toBe('invalid_credentials');
        expect((error as AuthAPIError).status).toBe(401);
      }
    });

    it('handles network errors', async () => {
      // Mock network error
      server.use(
        http.post('*/jwt-auth/v1/token', () => {
          throw new TypeError('Network request failed');
        })
      );

      const credentials = { username: 'testuser', password: 'password' };

      try {
        await authAPI.login(credentials);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthAPIError);
        expect((error as AuthAPIError).code).toBe('NETWORK_ERROR');
      }
    });
  });

  describe('refresh token', () => {
    it('refreshes token successfully', async () => {
      const refreshToken = 'refresh-token';

      // Mock refresh endpoint
      server.use(
        http.post('*/jwt-auth/v1/token/refresh', () => {
          return HttpResponse.json({
            token: 'new-jwt-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          });
        })
      );

      const response = await authAPI.refreshToken(refreshToken);

      expect(response).toMatchObject({
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      });
    });
  });

  describe('user profile updates', () => {
    it('updates user profile', async () => {
      const token = 'valid-token';
      const userId = 1;
      const userData = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      };

      // Mock update endpoint
      server.use(
        http.post(`*/wp/v2/users/${userId}`, () => {
          return HttpResponse.json({
            id: userId,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email,
            name: `${userData.firstName} ${userData.lastName}`,
          });
        })
      );

      const updatedUser = await authAPI.updateUser(token, userId, userData);

      expect(updatedUser).toMatchObject({
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated@example.com',
      });
    });
  });
});