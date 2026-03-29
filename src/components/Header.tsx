/**
 * Header component.
 * Responsibility: Navigation bar with brand logo and authentication state.
 */

'use client';

import Link from 'next/link';
import { BookOpen, User, LogOut, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary rounded-lg text-primary-foreground group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">WANINARU</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            問題一覧
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                  <User size={18} />
                </div>
                <span className="text-sm font-medium hidden md:inline-block">{user.email?.split('@')[0]}</span>
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-full transition-colors"
                title="ログアウト"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <LogIn size={16} />
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
