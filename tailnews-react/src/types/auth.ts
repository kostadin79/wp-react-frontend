// Authentication types for WordPress integration

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  avatar: string;
  description?: string;
  url?: string;
  registeredDate: string;
  meta?: Record<string, any>;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface JWTPayload {
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  data: {
    user: {
      id: number;
      username: string;
      email: string;
      roles: string[];
    };
  };
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
  data?: {
    status: number;
    [key: string]: any;
  };
}

// WordPress user roles
export const USER_ROLES = {
  SUBSCRIBER: 'subscriber',
  CONTRIBUTOR: 'contributor',
  AUTHOR: 'author',
  EDITOR: 'editor',
  ADMINISTRATOR: 'administrator',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// WordPress capabilities
export const CAPABILITIES = {
  READ: 'read',
  EDIT_POSTS: 'edit_posts',
  PUBLISH_POSTS: 'publish_posts',
  DELETE_POSTS: 'delete_posts',
  EDIT_OTHERS_POSTS: 'edit_others_posts',
  DELETE_OTHERS_POSTS: 'delete_others_posts',
  MANAGE_CATEGORIES: 'manage_categories',
  MODERATE_COMMENTS: 'moderate_comments',
  MANAGE_OPTIONS: 'manage_options',
  UPLOAD_FILES: 'upload_files',
} as const;

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];