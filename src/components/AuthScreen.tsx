import React, { useState } from 'react';
import { Mail, Key, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthScreenProps {
  onAuthSuccess: (session: { email: string; fullName: string; tier: 'Free' | 'Pro' | 'Pro+'; id?: string }) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        // Sign Up Mode
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              tier: 'Pro' // Default to convenient Pro level for testing/PRD evaluation
            }
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data?.user) {
          // If live supabase, bootstrap profile row manually in case webhook trigger didn't load first
          if (isSupabaseConfigured) {
            try {
              await supabase.from('profiles').insert({
                id: data.user.id,
                email: data.user.email!,
                full_name: fullName || data.user.email?.split('@')[0],
                tier: 'Pro'
              });
            } catch (err) {
              console.log('Profile insert skip/duplicate handled:', err);
            }
          }

          setSuccessMessage('Registration completed! Singing you in now...');
          setTimeout(() => {
            onAuthSuccess({
              email: data.user?.email || email,
              fullName: fullName || email.split('@')[0],
              tier: 'Pro',
              id: data.user?.id
            });
          }, 1000);
        } else {
          setSuccessMessage('Registration trigger fired. Please sign in!');
          setIsSignUp(false);
        }
      } else {
        // Sign In Mode
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data?.user) {
          // Fetch full profile from DB if possible
          let savedFullName = email.split('@')[0];
          let savedTier: 'Free' | 'Pro' | 'Pro+' = 'Pro';
          
          if (isSupabaseConfigured) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
              if (profile) {
                savedFullName = profile.full_name || savedFullName;
                savedTier = (profile.tier as any) || 'Pro';
              }
            } catch (err) {
              console.warn('Could not load profile row directly, falling back:', err);
            }
          } else {
            // Check mock session
            const userSessionStr = localStorage.getItem('krostio_user_session');
            if (userSessionStr) {
              try {
                const parsed = JSON.parse(userSessionStr);
                savedFullName = parsed.fullName || savedFullName;
                savedTier = parsed.tier || savedTier;
              } catch { /* ignore */ }
            }
          }

          onAuthSuccess({
            email: data.user.email || email,
            fullName: savedFullName,
            tier: savedTier,
            id: data.user.id
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication operation failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      onAuthSuccess({
        email: 'marcus.johnson@krostio.io',
        fullName: 'Marcus Johnson',
        tier: 'Pro'
      });
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f3f0ee] bg-cohere-grid flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Brand logo container */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#141413] flex items-center justify-center text-[#f3f0ee] font-serif font-bold text-lg select-none shadow-md mb-2">
          K
        </div>
        <h1 className="font-serif italic font-semibold text-2xl tracking-tight text-[#141413]">
          Krostio
        </h1>
        <p className="text-2xs font-mono tracking-widest text-[#4e4d4a] uppercase font-bold mt-1">
          DECIDABILITY ENGINE • CREDIT PASSPORT
        </p>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200/80 p-8 shadow-xl relative overflow-hidden">
        
        {/* Subtle accent border at top */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500"></div>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-serif italic font-bold text-[#141413]">
            {isSignUp ? 'Create your passport file' : 'Sign in to earnings ledger'}
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            {isSignUp 
              ? 'Consolidate multiple 1099 platform feeds in under 3 minutes.' 
              : 'Secure access to your verified gig income certificates.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200/80 p-3 rounded-lg flex items-start gap-2 text-xs text-red-600 font-sans">
            <span className="font-bold">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200/80 p-3 rounded-lg flex items-start gap-2 text-xs text-emerald-700 font-sans font-bold">
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold block">
                FULL NAME
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Marcus Johnson"
                  className="w-full bg-[#fbfaf8] border border-stone-200 hover:border-stone-300 focus:border-[#141413] focus:ring-1 focus:ring-[#141413] pl-9 pr-3 py-2 text-xs rounded-lg outline-none text-[#141413] font-sans transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold block">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Mail size={14} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#fbfaf8] border border-stone-200 hover:border-stone-300 focus:border-[#141413] focus:ring-1 focus:ring-[#141413] pl-9 pr-3 py-2 text-xs rounded-lg outline-none text-[#141413] font-sans transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold block">
              SECURE PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Key size={14} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#fbfaf8] border border-stone-200 hover:border-stone-300 focus:border-[#141413] focus:ring-1 focus:ring-[#141413] pl-9 pr-3 py-2 text-xs rounded-lg outline-none text-[#141413] font-sans transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#141413] hover:bg-stone-800 disabled:bg-stone-500 text-[#f3f0ee] font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-2 transition-colors uppercase tracking-wider font-mono cursor-pointer shadow-md mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Generate Passport Account' : 'Authenticate Credentials'}</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>

        </form>

        <div className="mt-5 pt-4 border-t border-stone-100 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold font-mono tracking-tight"
          >
            {isSignUp ? 'Already completed setup? Sign In' : 'New credential holder? Sign Up Now'}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 bg-[#f9f8f6] border border-stone-200/50 p-4 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600 text-3xs font-mono font-bold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Handshake Connection Mode</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
            {isSupabaseConfigured 
              ? 'Connected to live cloud cluster. Registration writes real tables instantly.' 
              : 'Local Sandbox simulation mode. You can sign in with any mock credentials.'}
          </p>
          {!isSupabaseConfigured && (
            <button
              onClick={triggerDemoLogin}
              className="text-[#141413] hover:underline hover:text-stone-700 font-mono text-[9px] uppercase font-bold tracking-wider mt-1 cursor-pointer"
            >
              ⚡ Instant Sandbox Demo Entry
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
