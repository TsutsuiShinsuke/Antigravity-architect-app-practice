/**
 * Auth Form component.
 * Responsibility: Handle sign in and sign up UI and logic.
 */

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 glass rounded-3xl space-y-8 animate-float">
      <div className="text-center">
        <h2 className="text-3xl font-bold">{isSignUp ? 'アカウント作成' : 'おかえりなさい'}</h2>
        <p className="text-muted-foreground mt-2">
          {isSignUp ? '合格への一歩を始めましょう' : '学習を再開しましょう'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Mail size={16} /> メールアドレス
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            placeholder="example@mail.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Lock size={16} /> パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-destructive text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? '登録する' : 'ログインする')}
        </button>
      </form>

      <div className="text-center">
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm font-semibold text-primary hover:underline transition-all"
        >
          {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'まだアカウントをお持ちでない方はこちら'}
        </button>
      </div>
    </div>
  );
}
