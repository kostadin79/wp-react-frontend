import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Tailnews React',
  description: 'Sign in to your Tailnews account to access exclusive content and features.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your personalized news experience
          </p>
        </div>
        
        <LoginForm />
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-red-600 hover:text-red-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-red-600 hover:text-red-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}