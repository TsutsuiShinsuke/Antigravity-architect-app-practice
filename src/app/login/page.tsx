/**
 * Login page.
 * Responsibility: Provide the entry point for user authentication.
 */

import AuthForm from '@/features/auth/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <AuthForm />
    </div>
  );
}
