import React, { useState, useEffect } from 'react';
import { User, Shield, Target, Scale, Save, Info, CheckCircle2, UserCheck, Key, LogOut } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserSession } from '../types';

interface SettingsTabProps {
  currentSession: UserSession;
  onUpdateSessionData: (updates: Partial<UserSession>) => void;
  onSignOut: () => void;
}

export default function SettingsTab({
  currentSession,
  onUpdateSessionData,
  onSignOut
}: SettingsTabProps) {
  // Input fields state
  const [fullName, setFullName] = useState(currentSession.fullName);
  const [email, setEmail] = useState(currentSession.email);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(5000);
  const [taxFilingStatus, setTaxFilingStatus] = useState('Single');
  const [avatarUrl, setAvatarUrl] = useState(currentSession.avatarUrl);
  
  // Loading and feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Fetch profiles table directly on startup if using live Supabase
  useEffect(() => {
    async function loadFullProfile() {
      if (!isSupabaseConfigured) {
        // Safe load from storage or custom session settings
        const customProfileStr = localStorage.getItem('krostio_custom_profile_fields');
        if (customProfileStr) {
          try {
            const parsed = JSON.parse(customProfileStr);
            setPhoneNumber(parsed.phone_number || '');
            setMonthlyIncomeGoal(parsed.monthly_income_goal || 5000);
            setTaxFilingStatus(parsed.tax_filing_status || 'Single');
            setAvatarUrl(parsed.avatar_url || currentSession.avatarUrl);
          } catch { /* ignore */ }
        }
        return;
      }

      try {
        setIsLoading(true);
        // Step 1: obtain authenticated session
        const { data: authData } = await supabase.auth.getSession();
        const authedUser = authData?.session?.user;
        if (!authedUser) return;

        // Step 2: query profiles table for authed user id
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authedUser.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || currentSession.fullName);
          setEmail(profile.email || currentSession.email);
          setPhoneNumber(profile.phone_number || '');
          setMonthlyIncomeGoal(Number(profile.monthly_income_goal) || 5000);
          setTaxFilingStatus(profile.tax_filing_status || 'Single');
          setAvatarUrl(profile.avatar_url || currentSession.avatarUrl);
        }
      } catch (err) {
        console.warn('Could not query live profiles table settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFullProfile();
  }, [currentSession.email]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    try {
      // Create updates payload
      const updatesPayload = {
        fullName,
        email,
        avatarUrl
      };

      if (isSupabaseConfigured) {
        // Query authed user first to locate rows accurately
        const { data: authData } = await supabase.auth.getSession();
        const authedUser = authData?.session?.user;
        if (!authedUser) {
          throw new Error('Authentication state lost. Please re-authenticate.');
        }

        // Commit profile fields straight to postgres profiles table
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            email: email,
            phone_number: phoneNumber,
            monthly_income_goal: monthlyIncomeGoal,
            tax_filing_status: taxFilingStatus,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', authedUser.id);

        if (error) throw new Error(error.message);
      } else {
        // Emulation state save
        localStorage.setItem('krostio_custom_profile_fields', JSON.stringify({
          phone_number: phoneNumber,
          monthly_income_goal: monthlyIncomeGoal,
          tax_filing_status: taxFilingStatus,
          avatar_url: avatarUrl
        }));

        // Keep local user session matched
        const localSess = {
          email,
          fullName,
          tier: currentSession.tier,
          avatarUrl,
          isCustomSupabase: false
        };
        localStorage.setItem('krostio_user_session', JSON.stringify(localSess));
        localStorage.setItem('krostio_user_session_v2', JSON.stringify(localSess));
      }

      // Keep active session in Memory of parent aligned
      onUpdateSessionData(updatesPayload);
      setSaveStatus('success');
      setFeedbackMsg('Your Krost file and financial parameters have been updated and synced successfully.');
      
      // Auto-clear success state after 3s
      setTimeout(() => setSaveStatus('idle'), 3000);

    } catch (err: any) {
      setSaveStatus('error');
      setFeedbackMsg(err.message || 'Failed to persist updates to the database.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Eyebrow section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-muted uppercase tracking-widest font-mono font-bold block mb-1">
            • SECURE WORKSPACE CONFIG
          </span>
          <h2 className="text-xl font-serif italic font-bold text-ink leading-tight">
            Profile Settings
          </h2>
          <p className="text-xs text-muted mt-1 font-sans">
            Manage your digital financial passport details and underwriting metrics.
          </p>
        </div>
        <button
          onClick={onSignOut}
          className="px-4 py-1.5 self-start sm:self-auto bg-stone hover:bg-stone/80 text-ink border border-border font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={12} className="text-coral" /> Log Out Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core inputs settings form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 md:p-8 shadow-xs">
          
          {saveStatus === 'success' && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-sans">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Settings Persisted!</strong>
                <span className="font-medium mt-0.5 block leading-normal">{feedbackMsg}</span>
              </div>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-sans">
              <Shield size={16} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Write Failure</strong>
                <span className="font-medium mt-0.5 block leading-normal">{feedbackMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Section 1: Personal Credentials */}
            <div>
              <h3 className="text-2xs font-mono font-bold uppercase tracking-wider text-ink border-b border-border pb-2 mb-4 flex items-center gap-1.5">
                <User size={13} className="text-muted" /> Personal Passport Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold block">
                    CURRENT FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-stone focus:border-ink px-3 py-2 text-xs rounded-lg outline-none text-ink font-sans transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold block">
                    PASSPORT EMAIL (ROUTER)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-stone focus:border-ink px-3 py-2 text-xs rounded-lg outline-none text-ink font-sans transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold block">
                    CONTACT PHONE NUMBER
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full bg-[#fbfaf8] border border-stone focus:border-ink px-3 py-2 text-xs rounded-lg outline-none text-ink font-sans transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold block">
                    AVATAR PORTRAIT URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-stone focus:border-ink px-3 py-2 text-xs rounded-lg outline-none text-ink font-sans transition-colors text-zinc-500 font-mono text-2xs overflow-ellipsis"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Underwriting Core Parameters */}
            <div>
              <h3 className="text-2xs font-mono font-bold uppercase tracking-wider text-ink border-b border-border pb-2 mb-4 flex items-center gap-1.5">
                <Target size={13} className="text-muted" /> Decidability & Credit Parameters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold flex items-center justify-between">
                    <span>MONTHLY INCOME GOAL</span>
                    <span className="text-green font-bold">Benchmark</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400 font-mono text-xs font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      required
                      min="500"
                      step="50"
                      value={monthlyIncomeGoal}
                      onChange={(e) => setMonthlyIncomeGoal(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#fbfaf8] border border-stone focus:border-ink pl-7 pr-3 py-2 text-xs rounded-lg outline-none text-ink font-sans transition-colors font-bold"
                    />
                  </div>
                  <span className="text-[9px] text-muted block leading-relaxed font-sans mt-1">
                    Used to gauge Krost Volatility Index relative to base target benchmarks.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold block">
                    TAX FILING CLASSIFICATION
                  </label>
                  <select
                    value={taxFilingStatus}
                    onChange={(e) => setTaxFilingStatus(e.target.value)}
                    className="w-full bg-[#fbfaf8] border border-stone focus:border-ink px-3 py-2 text-xs rounded-lg outline-none text-ink font-sans transition-colors font-bold cursor-pointer"
                  >
                    <option value="Single">Single</option>
                    <option value="Married Filing Jointly">Married Filing Jointly</option>
                    <option value="Married Filing Separately">Married Filing Separately</option>
                    <option value="Head of Household">Head of Household</option>
                  </select>
                  <span className="text-[9px] text-muted block leading-relaxed font-sans mt-1">
                    Helps compute correct estimated write-offs and baseline SE tax margins.
                  </span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="px-5 py-2 hover:bg-stone-800 disabled:bg-stone-500 bg-[#141413] text-[#f3f0ee] hover:text-[#f3f0ee] rounded-xl font-semibold text-xs font-mono tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-stone-200 border-t-transparent animate-spin rounded-full"></span>
                    <span>Commiting changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={13} className="text-green" />
                    <span>Persist Profile File</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Info card display */}
        <div className="space-y-6">
          
          {/* Card: Portfolio status */}
          <div className="bg-[#fffdfa] rounded-2xl border border-border p-6 shadow-3xs text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-green"></div>
            
            <div className="w-12 h-12 rounded-full overflow-hidden mx-auto border border-border bg-[#F5F2EB] flex items-center justify-center mb-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="text-muted w-6 h-6" />
              )}
            </div>

            <h4 className="font-serif italic font-bold text-ink text-base">
              {fullName}
            </h4>
            <span className={`inline-flex items-center gap-1 text-[8px] uppercase font-mono tracking-wider px-2.5 py-0.5 border rounded-md font-bold mt-1 ${
              currentSession.tier === 'Pro+'
                ? 'text-[#9A3A0A] bg-[#fbf3ef] border-[#fbf3ef]/30'
                : currentSession.tier === 'Pro'
                ? 'text-[#141413] bg-[#f5f2eb] border-border'
                : 'text-zinc-500 bg-stone border-border'
            }`}>
              {currentSession.tier === 'Free' ? '• Basic Access' : `👑 ${currentSession.tier} Premium`}
            </span>
            
            <p className="text-[10px] text-muted font-sans leading-relaxed mt-4">
              Your profile is registered and verified under the decentralized passport network. Any shared income certificates read from your live connected tables dynamically.
            </p>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase text-[#00AA44]">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
              <span>Account Status: Active</span>
            </div>
          </div>

          {/* Decidability tips */}
          <div className="bg-[#fcfbfa] rounded-2xl border border-border p-5 shadow-3xs leading-relaxed space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-wider text-ink font-bold flex items-center gap-1">
              <Info size={12} className="text-muted shrink-0" /> Decidability Engine Tips
            </h4>
            <p className="text-3xs text-zinc-500 font-sans leading-normal">
              Your <strong>Monthly Income Goal</strong> acts as the dynamic threshold denominator. Lowering this goal can boost alternative credit consistency ratios if platform diversity indices remain unchanged.
            </p>
            <div className="bg-white rounded-lg p-3 border border-border flex items-start gap-2.5 text-3xs text-zinc-600 font-mono">
              <UserCheck size={14} className="text-[#CF4500] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink block font-sans">Verification Stamp</span>
                <span className="block mt-0.5 font-sans">Underwriter certificates match tax classifications strictly on file locks.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
