import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';
import { AuthAPIError } from '@/lib/auth-api';

// Mock the auth context
const mockLogin = jest.fn();
const mockAuthContext = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: mockLogin,
  logout: jest.fn(),
  register: jest.fn(),
  refreshAuth: jest.fn(),
  updateUser: jest.fn(),
  checkAuth: jest.fn(),
};

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

describe('LoginForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to input username and password', async () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('toggles password visibility', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('handles remember me checkbox', async () => {
    render(<LoginForm />);

    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);

    expect(rememberMeCheckbox).not.toBeChecked();

    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('submits form with correct credentials', async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByLabelText(/remember me/i));

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
        rememberMe: true,
      });
    });
  });

  it('displays loading state during submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('displays error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new AuthAPIError(errorMessage, 'AUTH_ERROR', 401));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays generic error message for unknown errors', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Unknown error'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });

  it('prevents submission with empty fields', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Try to submit without filling fields
    fireEvent.click(submitButton);

    // Should not call login function
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls onSuccess callback on successful login', async () => {
    const onSuccess = jest.fn();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginForm onSuccess={onSuccess} />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('redirects to specified URL on successful login', async () => {
    const redirectTo = '/dashboard';
    mockLogin.mockResolvedValueOnce(undefined);

    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<LoginForm redirectTo={redirectTo} />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.href).toBe(redirectTo);
    });
  });

  it('has proper form validation', async () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('disables form inputs during submission', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username or email/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByLabelText(/username or email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByLabelText(/remember me/i)).toBeDisabled();
  });

  it('renders social login options', () => {
    render(<LoginForm />);

    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
  });

  it('renders registration and forgot password links', () => {
    render(<LoginForm />);

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up here/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('supports keyboard navigation', async () => {
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Tab navigation
    usernameInput.focus();
    expect(usernameInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    await user.tab(); // Skip remember me checkbox
    expect(submitButton).toHaveFocus();
  });
});