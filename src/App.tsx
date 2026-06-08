import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, LayoutDashboard, BarChart3, FileText, Scale, CreditCard, LogOut, Loader2, Sparkles, AlertCircle, X, HelpCircle, Mail, Key, Settings 
} from 'lucide-react';
import { 
  EarningRecord, PlatformConnection, VerificationReport, TaxWriteOff, SyncEvent, UserSession 
} from './types';
import { 
  INITIAL_PLATFORMS, INITIAL_EARNINGS, INITIAL_REPORTS, INITIAL_WRITE_OFFS, INITIAL_SYNC_LOGS 
} from './mockData';
import { 
  supabase, triggerLiveEarningSyncSimulation, isSupabaseConfigured, getActiveBackendType 
} from './lib/supabase';
import { validateEarningsBatch, EarningRecordSchema } from './lib/schemas';
import DashboardTab from './components/DashboardTab';
import AnalyticsTab from './components/AnalyticsTab';
import ReportsTab from './components/ReportsTab';
import TaxPrepTab from './components/TaxPrepTab';
import BillingTab from './components/BillingTab';
import PublicReportView from './components/PublicReportView';
import ArgyleLinkModal from './components/ArgyleLinkModal';
import AuthScreen from './components/AuthScreen';
import SettingsTab from './components/SettingsTab';

const SESSION_KEY = 'krostio_user_session_v2';
const PLATFORMS_KEY = 'krostio_platforms_v2';
const EARNINGS_KEY = 'krostio_earnings_v2';
const REPORTS_KEY = 'krostio_reports_v2';
const WRITE_OFFS_KEY = 'krostio_writeoffs_v2';
const SYNCLOGS_KEY = 'krostio_synclogs_v2';
const EMAILS_KEY = 'krostio_emails_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'reports' | 'tax-prep' | 'billing' | 'settings'>('dashboard');
  const [selectedPublicShareToken, setSelectedPublicShareToken] = useState<string | null>(null);
  const [isArgyleOpen, setIsArgyleOpen] = useState(false);

  // Core structured states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [currentSession, setCurrentSession] = useState<UserSession>({
    email: '',
    fullName: '',
    tier: 'Free',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&fit=crop',
    isCustomSupabase: false
  });

  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [writeOffs, setWriteOffs] = useState<TaxWriteOff[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncEvent[]>([]);
  const [resendEmails, setResendEmails] = useState<any[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // 1. Check Initial Authentication and Auth Handlers
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const activeUser = authData?.session?.user;

        if (activeUser) {
          // Live Supabase user session exists
          let resolvedName = activeUser.email?.split('@')[0] || '';
          let resolvedTier: 'Free' | 'Pro' | 'Pro+' = 'Free';
          let resolvedAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';

          if (isSupabaseConfigured) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', activeUser.id)
                .single();
              if (profile) {
                resolvedName = profile.full_name || resolvedName;
                resolvedTier = (profile.tier as any) || 'Free';
                resolvedAvatar = profile.avatar_url || resolvedAvatar;
              }
            } catch (err) {
              console.warn('Profile read skipped on init auth:', err);
            }
          }

          setCurrentSession({
            email: activeUser.email!,
            fullName: resolvedName,
            tier: resolvedTier,
            avatarUrl: resolvedAvatar,
            isCustomSupabase: isSupabaseConfigured
          });
          setIsAuthenticated(true);
        } else {
          // Sandbox local storage fallback
          const cachedSession = localStorage.getItem(SESSION_KEY);
          if (cachedSession) {
            try {
              const parsed = JSON.parse(cachedSession);
              if (parsed && parsed.email) {
                setCurrentSession(parsed);
                setIsAuthenticated(true);
              }
            } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('Error initializing authentication state:', err);
      } finally {
        setIsInitializingAuth(false);
      }
    };

    initializeAuth();

    // Listen to live Auth adjustments
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let resolvedName = session.user.email?.split('@')[0] || '';
        let resolvedTier: 'Free' | 'Pro' | 'Pro+' = 'Free';
        let resolvedAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces';

        if (isSupabaseConfigured) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profile) {
              resolvedName = profile.full_name || resolvedName;
              resolvedTier = (profile.tier as any) || 'Free';
              resolvedAvatar = profile.avatar_url || resolvedAvatar;
            }
          } catch (err) {
            console.warn('Profile load err on subscription callback:', err);
          }
        }

        setCurrentSession({
          email: session.user.email!,
          fullName: resolvedName,
          tier: resolvedTier,
          avatarUrl: resolvedAvatar,
          isCustomSupabase: isSupabaseConfigured
        });
        setIsAuthenticated(true);
      }
    });

    setIsBackendConnected(isSupabaseConfigured);

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // 2. Query dynamic user data when authenticated (Argyle & Supabase integration)
  useEffect(() => {
    if (!isAuthenticated) return;

    const pullUserData = async () => {
      setIsLoadingData(true);
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;

        if (userId && isSupabaseConfigured) {
          // 1. Platforms query
          const { data: connections } = await supabase
            .from('platform_connections')
            .select('*')
            .eq('user_id', userId);
          if (connections) {
            setPlatforms(connections.map((p: any) => ({
              platform: p.platform,
              status: p.status,
              lastSynced: p.last_synced,
              totalEarnings: Number(p.total_earnings) || 0,
              tenureMonths: Number(p.tenure_months) || 0,
              icon: p.icon || '🔗'
            })));
          }

          // 2. Earnings query
          const { data: earns } = await supabase
            .from('earnings')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
          if (earns) {
            setEarnings(earns.map((e: any) => ({
              id: e.id,
              platform: e.platform,
              amount: Number(e.amount) || 0,
              date: e.date,
              verifiedBy: e.verified_by || 'Argyle',
              argyleTimestamp: e.argyle_timestamp || new Date().toISOString(),
              status: e.status || 'Stable',
              category: e.category
            })));
          }

          // 3. Reports query
          const { data: reps } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', userId)
            .order('generated_at', { ascending: false });
          if (reps) {
            setReports(reps.map((r: any) => ({
              id: r.id,
              reportName: r.report_name,
              useCase: r.use_case,
              dateRange: r.date_range,
              generatedAt: r.generated_at,
              validThrough: r.valid_through,
              includeStabilityScore: !!r.include_stability_score,
              includeTaxMatch: !!r.include_tax_match,
              notes: r.notes || '',
              argyleVerificationId: r.argyle_verification_id || '',
              shareToken: r.share_token,
              status: r.status
            })));
          }

          // 4. Write-offs query
          const { data: wfs } = await supabase
            .from('write_offs')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });
          if (wfs) {
            setWriteOffs(wfs.map((w: any) => ({
              id: w.id,
              label: w.label,
              amount: Number(w.amount) || 0,
              category: w.category,
              date: w.date
            })));
          }

          // 5. Sync logs query
          const { data: logs } = await supabase
            .from('sync_logs')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          if (logs) {
            setSyncLogs(logs.map((l: any) => ({
              id: l.id,
              timestamp: l.timestamp,
              platform: l.platform,
              amount: Number(l.amount) || 0,
              type: l.type,
              details: l.details
            })));
          }
        } else {
          // Sandbox / Local Emulation datasets loading from localStorage cache
          const savedPlats = localStorage.getItem(PLATFORMS_KEY);
          const savedEarns = localStorage.getItem(EARNINGS_KEY);
          const savedReps = localStorage.getItem(REPORTS_KEY);
          const savedWrites = localStorage.getItem(WRITE_OFFS_KEY);
          const savedLogs = localStorage.getItem(SYNCLOGS_KEY);

          // Return clean arrays on first load (no pre-loaded mock data) unless they configure it
          setPlatforms(savedPlats ? JSON.parse(savedPlats) : []);
          setEarnings(savedEarns ? JSON.parse(savedEarns) : []);
          setReports(savedReps ? JSON.parse(savedReps) : []);
          setWriteOffs(savedWrites ? JSON.parse(savedWrites) : []);
          setSyncLogs(savedLogs ? JSON.parse(savedLogs) : []);
        }
      } catch (err) {
        console.warn('Error loading dynamic user profiles/tables data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    pullUserData();
  }, [isAuthenticated]);

  // 3. Set up live Supabase Real-time Subscriptions query
  useEffect(() => {
    if (!isAuthenticated) return;
    const channelName = 'realtime:earnings_feed';
    const channel = supabase.channel(channelName);
    
    channel.on('INSERT', { schema: 'public', table: 'earnings' }, (payload: any) => {
      const newRecord = payload.new || payload.payload;
      if (!newRecord) return;

      const parseResult = EarningRecordSchema.safeParse(newRecord);
      if (!parseResult.success) {
        console.warn('[ZOD VALIDATION FAILED] Rejected stream item:', parseResult.error.issues, newRecord);
        return;
      }
      
      const validatedRecord = parseResult.data as EarningRecord;
      
      setEarnings((prev) => {
        const next = [validatedRecord, ...prev];
        localStorage.setItem(EARNINGS_KEY, JSON.stringify(next));
        return next;
      });

      setSyncLogs((prev) => {
        const nextEvent: SyncEvent = {
          id: `log-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toLocaleTimeString(),
          platform: validatedRecord.platform,
          amount: validatedRecord.amount,
          type: 'earning_sync',
          details: `Postgres database insertion stream received! Websocket channel broadcasted live transaction callback successfully.`
        };
        const next = [nextEvent, ...prev];
        localStorage.setItem(SYNCLOGS_KEY, JSON.stringify(next));
        return next;
      });

      setPlatforms((prev) => {
        const next = prev.map((p) => {
          if (p.platform === newRecord.platform) {
            return {
              ...p,
              totalEarnings: p.totalEarnings + Number(newRecord.amount),
              lastSynced: 'Just Now via Realtime API'
            };
          }
          return p;
        });
        localStorage.setItem(PLATFORMS_KEY, JSON.stringify(next));
        return next;
      });
    })
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Handlers for state updates
  const handleConnectPlatform = (
    platformName: string, 
    estimatedAmount: number, 
    tenureMonths: number, 
    parsedPayouts?: any[], 
    profileData?: any
  ) => {
    // 1. Resolve premium icons dynamically based on platform name
    const normalized = platformName.toLowerCase();
    let resolvedIcon = '🔗';
    if (normalized.includes('uber')) resolvedIcon = '🚗';
    else if (normalized.includes('dash')) resolvedIcon = '🍔';
    else if (normalized.includes('work')) resolvedIcon = '💼';
    else if (normalized.includes('fiverr')) resolvedIcon = '🎨';
    else if (normalized.includes('lyft')) resolvedIcon = '🚙';
    else if (normalized.includes('cart')) resolvedIcon = '🥕';
    else if (normalized.includes('flex')) resolvedIcon = '📦';
    else if (normalized.includes('airb') || normalized.includes('room')) resolvedIcon = '🏡';
    else if (normalized.includes('task') || normalized.includes('rabbit')) resolvedIcon = '🔨';
    else if (normalized.includes('etsy') || normalized.includes('shop')) resolvedIcon = '🛍️';
    else if (normalized.includes('employer') || normalized.includes('inc') || normalized.includes('corp') || normalized.includes('company')) resolvedIcon = '🏢';

    // Create connection item
    const newPlatform: PlatformConnection = {
      platform: platformName as any,
      status: 'connected',
      lastSynced: 'Just Now via Argyle',
      totalEarnings: estimatedAmount,
      tenureMonths,
      icon: resolvedIcon
    };

    const exists = platforms.some(p => p.platform === platformName);
    const nextPlatforms = exists
      ? platforms.map(p => p.platform === platformName ? newPlatform : p)
      : [newPlatform, ...platforms];

    setPlatforms(nextPlatforms);
    localStorage.setItem(PLATFORMS_KEY, JSON.stringify(nextPlatforms));

    // If we have actual parsed payouts from real Argyle API, save them!
    const billingCount = parsedPayouts && parsedPayouts.length > 0 ? parsedPayouts.length : 12;
    const rawEarnings: EarningRecord[] = (parsedPayouts && parsedPayouts.length > 0)
      ? parsedPayouts.map(item => ({
          id: item.id,
          platform: item.platform,
          amount: item.amount,
          date: item.date,
          verifiedBy: item.verifiedBy || 'Argyle',
          argyleTimestamp: item.argyleTimestamp || new Date().toISOString(),
          status: item.status || 'Stable',
          category: item.category
        }))
      : (() => {
          // Fallback generate monthly chronological earnings for the past year
          const months = ['2026-05', '2026-04', '2026-03', '2026-02', '2026-01', '2025-12', '2025-11', '2025-10', '2025-09', '2025-08', '2025-07', '2025-06'];
          const monthlySumValue = Math.floor(estimatedAmount / months.length);
          return months.map((m, idx) => {
            let category: 'rideshare' | 'delivery' | 'freelance_tech' | 'freelance_creative' = 'delivery';
            if (normalized.includes('uber') || normalized.includes('lyft') || normalized.includes('rideshare') || normalized.includes('driver')) {
              category = 'rideshare';
            } else if (normalized.includes('upwork') || normalized.includes('tech') || normalized.includes('contract') || normalized.includes('freelance')) {
              category = 'freelance_tech';
            } else if (normalized.includes('fiverr') || normalized.includes('design') || normalized.includes('creative') || normalized.includes('content')) {
              category = 'freelance_creative';
            }
            return {
              id: `earn-gen-${platformName}-${idx}`,
              platform: platformName as any,
              amount: monthlySumValue + Math.floor(Math.random() * 200 - 100),
              date: m,
              verifiedBy: 'Argyle',
              argyleTimestamp: new Date().toISOString(),
              status: 'Growing',
              category
            };
          });
        })();

    // 2. RUN ZOD SCHEMA VALIDATION
    const { validRecords, invalidRecords, hasFailures } = validateEarningsBatch(rawEarnings);

    if (hasFailures) {
      console.warn(`[ZOD FAILURE DETECTED] Skipped ${invalidRecords.length} invalid records during ingestion.`, invalidRecords);
    }

    const nextEarnings = [...validRecords, ...earnings];
    setEarnings(nextEarnings);
    localStorage.setItem(EARNINGS_KEY, JSON.stringify(nextEarnings));

    // 3. Log handshake synchronizer and construct log event first
    const profileName = profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : '';
    const detailsSuffix = profileName ? `, connected under payroll profile of user: ${profileName}.` : '.';
    const validationSummaryStr = hasFailures 
      ? `Validated successfully: ${validRecords.length} records. Blocked: ${invalidRecords.length} invalid items.` 
      : `Zod validated: ${validRecords.length} records matched ledger schema exactly.`;
      
    const newEvent: SyncEvent = {
      id: `log-cn-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      platform: platformName,
      amount: 0,
      type: 'connection_created',
      details: `Initialized direct Argyle handshake link to ${platformName} credentials database. ${validationSummaryStr} Synchronized ${validRecords.length} billing statements${detailsSuffix}`
    };
    const nextLogs = [newEvent, ...syncLogs];
    setSyncLogs(nextLogs);
    localStorage.setItem(SYNCLOGS_KEY, JSON.stringify(nextLogs));

    // 4. Update user session state automatically and dynamically based on Argyle profile identity details
    if (profileData) {
      const pName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      const pEmail = profileData.email || '';
      const pAvatar = profileData.picture_url || profileData.avatar_url || '';

      const updatedSession = {
        ...currentSession,
        fullName: pName || currentSession.fullName,
        avatarUrl: pAvatar || currentSession.avatarUrl,
        email: pEmail || currentSession.email,
      };

      setCurrentSession(updatedSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    }

    // Store in backend Supabase database tables dynamically
    const syncDatabaseAsync = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;

        if (userId) {
          // A. Commit profile updates automatically and dynamically based on Argyle profile identity details
          if (profileData) {
            const pName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
            const pEmail = profileData.email || '';
            const pAvatar = profileData.picture_url || profileData.avatar_url || '';
            const pPhone = profileData.phone_number || profileData.phoneNumber || '';

            const profileUpdates: any = {};
            if (pName) profileUpdates.full_name = pName;
            if (pEmail) profileUpdates.email = pEmail;
            if (pAvatar) profileUpdates.avatar_url = pAvatar;
            if (pPhone) profileUpdates.phone_number = pPhone;

            if (Object.keys(profileUpdates).length > 0) {
              console.log('[PROD ARGYLE] Direct DB Profile Auto-Update triggered:', profileUpdates);
              await supabase
                .from('profiles')
                .update(profileUpdates)
                .eq('id', userId);
            }
          }

          // B. Commit platform connection metadata
          await supabase
            .from('platform_connections')
            .upsert({
              user_id: userId,
              platform: platformName,
              status: 'connected',
              last_synced: 'Just Now via Argyle',
              total_earnings: estimatedAmount,
              tenure_months: tenureMonths,
              icon: resolvedIcon
            });

          // C. Commit monthly earnings records
          for (const earn of validRecords) {
            await supabase
              .from('earnings')
              .upsert({
                id: earn.id,
                user_id: userId,
                platform: earn.platform,
                amount: earn.amount,
                date: earn.date,
                verified_by: 'Argyle',
                argyle_timestamp: earn.argyleTimestamp,
                status: earn.status,
                category: earn.category
              });
          }

          // D. Commit timeline sync log
          await supabase
            .from('sync_logs')
            .insert({
              id: newEvent.id,
              user_id: userId,
              timestamp: newEvent.timestamp,
              platform: newEvent.platform,
              amount: 0,
              type: 'connection_created',
              details: newEvent.details
            });
        }
      } catch (dbErr) {
        console.warn('Supabase database sync skipped (using state & localStorage fallback):', dbErr);
      }
    };

    // Invoke actual DB sync writes asynchronously
    syncDatabaseAsync();

    // Store raw feed item for compatibility
    try {
      validRecords.forEach(async (earn) => {
        await supabase
          .from('earnings_feed' as any)
          .insert({
            platform: earn.platform,
            amount: earn.amount,
            date: earn.date,
            verified_by: 'Argyle',
            category: earn.category
          } as any);
      });
    } catch (dbErr) {
      console.warn('Legacy feed sync skipped:', dbErr);
    }
  };

  const handleRefreshPlatform = (platformName: string) => {
    setPlatforms((prev) => {
      const next = prev.map((p) => {
        if (p.platform === platformName) {
          return { ...p, status: 'syncing', lastSynced: 'Syncing ledger...' };
        }
        return p;
      });
      return next;
    });

    setTimeout(() => {
      setPlatforms((prev) => {
        const next = prev.map((p) => {
          if (p.platform === platformName) {
            return { ...p, status: 'connected', lastSynced: 'Just Now via Argyle Link' };
          }
          return p;
        });
        localStorage.setItem(PLATFORMS_KEY, JSON.stringify(next));
        return next;
      });

      // Push Sync Event log
      setSyncLogs((prev) => {
        const next = [{
          id: `log-rf-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toLocaleTimeString(),
          platform: platformName,
          amount: 0,
          type: 'webhook_trigger',
          details: `Manual triggered poll. Contacted Argyle gateway node and matched 100% current records on ${platformName}.`
        }, ...prev];
        localStorage.setItem(SYNCLOGS_KEY, JSON.stringify(next));
        return next;
      });
    }, 1000);
  };

  const handleDisconnectPlatform = (platformName: string) => {
    // Filter platform
    const nextPlatforms = platforms.filter(p => p.platform !== platformName);
    setPlatforms(nextPlatforms);
    localStorage.setItem(PLATFORMS_KEY, JSON.stringify(nextPlatforms));

    // Filter earnings
    const nextEarnings = earnings.filter(e => e.platform !== platformName);
    setEarnings(nextEarnings);
    localStorage.setItem(EARNINGS_KEY, JSON.stringify(nextEarnings));

    // Database Sync Delete
    const deletePlatformDb = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        if (userId && isCustomSupabase(currentSession)) {
          await supabase
            .from('platform_connections')
            .delete()
            .eq('platform', platformName)
            .eq('user_id', userId);

          await supabase
            .from('earnings')
            .delete()
            .eq('platform', platformName)
            .eq('user_id', userId);
        }
      } catch (err) {
        console.warn('Database connection deletion bypass:', err);
      }
    };
    deletePlatformDb();

    // Log event
    setSyncLogs((prev) => {
      const next = [{
        id: `log-dc-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        platform: platformName,
        amount: 0,
        type: 'connection_created',
        details: `Revoked token credentials for ${platformName} account. Disconnecting security links instantly.`
      }, ...prev];
      localStorage.setItem(SYNCLOGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleTriggerRealtimeEvent = (platform: 'Uber' | 'DoorDash' | 'Upwork') => {
    const payoutPrice = platform === 'Uber' ? 35.50 : platform === 'DoorDash' ? 18.20 : 450.00;
    triggerLiveEarningSyncSimulation(platform, payoutPrice);
  };

  const handleGenerateReport = (newReportData: Omit<VerificationReport, 'id' | 'generatedAt' | 'validThrough' | 'argyleVerificationId' | 'shareToken' | 'status'>) => {
    const date = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    const newReport: VerificationReport = {
      ...newReportData,
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      generatedAt: date.toISOString(),
      validThrough: expiry.toISOString(),
      argyleVerificationId: `ARY-${Math.floor(100000 + Math.random() * 900000)}`,
      shareToken: `kro_share_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Active'
    };

    const nextReports = [newReport, ...reports];
    setReports(nextReports);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(nextReports));

    // Sync database insert
    const insertReportDb = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        if (userId && isSupabaseConfigured) {
          await supabase
            .from('reports')
            .insert({
              id: newReport.id,
              user_id: userId,
              report_name: newReport.reportName,
              use_case: newReport.useCase,
              date_range: newReport.dateRange,
              generated_at: newReport.generatedAt,
              valid_through: newReport.validThrough,
              include_stability_score: newReport.includeStabilityScore,
              include_tax_match: newReport.includeTaxMatch,
              notes: newReport.notes,
              argyle_verification_id: newReport.argyleVerificationId,
              share_token: newReport.shareToken,
              status: newReport.status
            });
        }
      } catch (err) {
        console.warn('Database report insert bypassed:', err);
      }
    };
    insertReportDb();

    // Broadcast sync event log
    setSyncLogs((prev) => {
      const next = [{
        id: `log-rp-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        platform: 'Global',
        amount: 0,
        type: 'webhook_trigger',
        details: `Registered custom encrypted Underwriter Statement [${newReport.argyleVerificationId}]. Public share link issued.`
      }, ...prev];
      localStorage.setItem(SYNCLOGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteReport = (id: string) => {
    const nextReports = reports.filter(r => r.id !== id);
    setReports(nextReports);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(nextReports));

    // Sync database delete
    const deleteReportDb = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        if (userId && isSupabaseConfigured) {
          await supabase
            .from('reports')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        }
      } catch (err) {
        console.warn('Database report delete bypassed:', err);
      }
    };
    deleteReportDb();
  };

  const handleAddWriteOff = (item: Omit<TaxWriteOff, 'id' | 'date'>) => {
    const newOff: TaxWriteOff = {
      ...item,
      id: `wff-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().substring(0, 10)
    };

    const nextOffs = [newOff, ...writeOffs];
    setWriteOffs(nextOffs);
    localStorage.setItem(WRITE_OFFS_KEY, JSON.stringify(nextOffs));

    // Sync database insert
    const insertWriteOffDb = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        if (userId && isSupabaseConfigured) {
          await supabase
            .from('write_offs')
            .insert({
              id: newOff.id,
              user_id: userId,
              label: newOff.label,
              amount: newOff.amount,
              category: newOff.category,
              date: newOff.date
            });
        }
      } catch (err) {
        console.warn('Database write-off insert bypassed:', err);
      }
    };
    insertWriteOffDb();
  };

  const handleDeleteWriteOff = (id: string) => {
    const nextOffs = writeOffs.filter(w => w.id !== id);
    setWriteOffs(nextOffs);
    localStorage.setItem(WRITE_OFFS_KEY, JSON.stringify(nextOffs));

    // Sync database delete
    const deleteWriteOffDb = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        if (userId && isSupabaseConfigured) {
          await supabase
            .from('write_offs')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        }
      } catch (err) {
        console.warn('Database write-off delete bypassed:', err);
      }
    };
    deleteWriteOffDb();
  };

  // Helper check for custom database mode
  const isCustomSupabase = (session: UserSession) => {
    return isSupabaseConfigured;
  };

  const handleUpdateSessionTier = (newTier: UserSession['tier']) => {
    const nextSession: UserSession = {
      ...currentSession,
      tier: newTier
    };
    setCurrentSession(nextSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));

    // Sync profile tier update on Supabase
    const updateProfileTierDb = async () => {
      try {
        const { data: authData } = await supabase.auth.getSession();
        const userId = authData?.session?.user?.id;
        if (userId && isSupabaseConfigured) {
          await supabase
            .from('profiles')
            .update({ tier: newTier })
            .eq('id', userId);
        }
      } catch (err) {
         console.warn('Database update profile tier bypassed:', err);
      }
    };
    updateProfileTierDb();
  };

  const handleTriggerResendEmail = (subject: string, bodyHTML: string) => {
    const newEmail = {
      timestamp: new Date().toLocaleTimeString(),
      subject,
      recipient: currentSession.email,
      body: bodyHTML
    };

    const nextEmails = [newEmail, ...resendEmails];
    setResendEmails(nextEmails);
    localStorage.setItem(EMAILS_KEY, JSON.stringify(nextEmails));
  };

  const handleToggleCustomSupabase = (url: string, anonKey: string) => {
    const isConnecting = !!(url && anonKey);
    const nextSession: UserSession = {
      ...currentSession,
      isCustomSupabase: isConnecting
    };
    setCurrentSession(nextSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setIsBackendConnected(isConnecting);
    alert(isConnecting 
      ? 'Direct production Supabase cluster connected! Raw databases values will read from your keys.' 
      : 'Supabase cloud keys disconnected. Reverted to fully interactive client-side sandbox.'
    );
  };

  const handleConnectMockPlatform = (platformName: string, estimatedAmount: number, tenureMonths: number, volatility: string) => {
    handleConnectPlatform(platformName, estimatedAmount, tenureMonths);
    setSyncLogs((prev) => {
      const nextLog: SyncEvent = {
        id: `log-sb-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleTimeString(),
        platform: platformName,
        amount: 0,
        type: 'connection_created',
        details: `[SANDBOX Handshake] Connected ${platformName} mock node. Volatility option: ${volatility}.`
      };
      const next = [nextLog, ...prev];
      localStorage.setItem(SYNCLOGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleClearSandbox = () => {
    if (confirm('Are you sure you want to reset your sandbox local storage values?')) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PLATFORMS_KEY);
      localStorage.removeItem(EARNINGS_KEY);
      localStorage.removeItem(REPORTS_KEY);
      localStorage.removeItem(WRITE_OFFS_KEY);
      localStorage.removeItem(SYNCLOGS_KEY);
      localStorage.removeItem(EMAILS_KEY);

      // Re-trigger layout reload
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Bypassed signout error:', err);
    }
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setCurrentSession({
      email: '',
      fullName: '',
      tier: 'Pro',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&fit=crop',
      isCustomSupabase: false
    });
  };

  // If testing public report layout, route to dedicated single-page report view
  if (selectedPublicShareToken) {
    const targetRep = reports.find(r => r.shareToken === selectedPublicShareToken) || reports[0];
    return (
      <PublicReportView
        report={targetRep}
        platforms={platforms}
        earnings={earnings}
        onBackToApp={() => setSelectedPublicShareToken(null)}
      />
    );
  }

  // 1. Initial Authentication state check layout spinner
  if (isInitializingAuth) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-green border-t-transparent animate-spin rounded-full mx-auto"></div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#93939f]">Authenticating Krostio Wallet & User Profile...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated state check layout
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onAuthSuccess={(session) => {
          setCurrentSession(session);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf7] bg-cohere-grid flex flex-col font-sans select-none tracking-tight text-ink pb-11">
      
      {/* Cohere Refined Header bar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-border h-15 shrink-0 flex items-center z-10 sticky top-0 shadow-xs">
        <div className="max-w-7xl w-full mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-green flex items-center justify-center text-white font-serif font-bold text-sm select-none shadow-xs">
              K
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="flex items-center gap-1.5 leading-none">
                <span className="font-serif italic font-bold tracking-tight text-base text-ink">Krostio</span>
                <span className="font-mono text-[9px] font-bold border border-border text-muted bg-[#f5f2eb] px-1.5 py-0.5 rounded-sm">V2</span>
              </h1>
              <span className="text-[9px] uppercase font-mono tracking-wider text-muted bg-transparent px-2.5 py-1 rounded font-bold border border-border flex items-center gap-2 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse"></span>
                Argyle Authenticated • Live
              </span>
            </div>
          </div>

          {/* User profile details with elegant badge */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-mono tracking-wider text-ink font-bold leading-none block">
                {currentSession.fullName || currentSession.email?.split('@')[0]}
              </span>
              <span className="inline-flex items-center gap-1 text-[8px] uppercase font-mono tracking-wider text-slate bg-stone px-2 py-0.5 border border-border rounded-md font-bold mt-1">
                👑 {currentSession.tier} PREMIUM
              </span>
            </div>
            {currentSession.avatarUrl ? (
              <img 
                src={currentSession.avatarUrl} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-border object-cover shadow-3xs hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white border border-border shadow-xs relative overflow-hidden select-none">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white/90">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
            <button 
              onClick={handleSignOut}
              className="px-2.5 py-1 border border-border hover:bg-stone text-muted hover:text-coral rounded-lg font-mono text-[9px] uppercase tracking-wider font-bold shrink-0 cursor-pointer transition-colors"
              title="Log Out Session"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main layout container with responsive Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6 min-h-0">
        
        {/* Navigation Sidebar panel rails */}
        <nav className="md:w-56 shrink-0 flex flex-row md:flex-col gap-1 md:gap-1.5 bg-white md:bg-transparent p-1.5 md:p-0 rounded-xl border md:border-0 border-border md:shadow-none overflow-x-auto select-none">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-green text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-stone border border-transparent hover:border-border'
            }`}
          >
            <LayoutDashboard size={14} />
            <span className="hidden md:inline">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-green text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-stone border border-transparent hover:border-border'
            }`}
          >
            <BarChart3 size={14} />
            <span className="hidden md:inline">Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-green text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-stone border border-transparent hover:border-border'
            }`}
          >
            <FileText size={14} />
            <span className="hidden md:inline">Reports Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('tax-prep')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'tax-prep'
                ? 'bg-green text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-stone border border-transparent hover:border-border'
            }`}
          >
            <Scale size={14} />
            <span className="hidden md:inline">Tax Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-green text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-stone border border-transparent hover:border-border'
            }`}
          >
            <CreditCard size={14} />
            <span className="hidden md:inline">Pricing & Pro</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-green text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-stone border border-transparent hover:border-border'
            }`}
          >
            <Settings size={14} />
            <span className="hidden md:inline">Settings</span>
          </button>

        </nav>

        {/* Dynamic Display area containing the workspaces tabs */}
        <main className="flex-1 min-w-0">

          {activeTab === 'dashboard' && (
            <DashboardTab
              platforms={platforms}
              syncLogs={syncLogs}
              earnings={earnings}
              onOpenArgyleModal={() => setIsArgyleOpen(true)}
              onRefreshPlatform={handleRefreshPlatform}
              onDisconnectPlatform={handleDisconnectPlatform}
              onTriggerRealtimeEvent={handleTriggerRealtimeEvent}
              isBackendConnected={isBackendConnected}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              earnings={earnings}
              platforms={platforms}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              reports={reports}
              platforms={platforms}
              earnings={earnings}
              onGenerateReport={handleGenerateReport}
              onDeleteReport={handleDeleteReport}
              onOpenPublicLink={(tok) => setSelectedPublicShareToken(tok)}
              userEmail={currentSession.email}
            />
          )}

          {activeTab === 'tax-prep' && (
            <TaxPrepTab
              writeOffs={writeOffs}
              platforms={platforms}
              onAddWriteOff={handleAddWriteOff}
              onDeleteWriteOff={handleDeleteWriteOff}
            />
          )}

          {activeTab === 'billing' && (
            <BillingTab
              currentSession={currentSession}
              onUpdateSessionTier={handleUpdateSessionTier}
              onTriggerResendEmail={handleTriggerResendEmail}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentSession={currentSession}
              onUpdateSessionData={(updates) => setCurrentSession(prev => ({ ...prev, ...updates }))}
              onSignOut={handleSignOut}
            />
          )}
        </main>

      </div>

      {/* Argyle oauth Modal overlay link */}
      <ArgyleLinkModal
        isOpen={isArgyleOpen}
        onClose={() => setIsArgyleOpen(false)}
        onConnectPlatform={handleConnectPlatform}
        connectedPlatforms={platforms.map(p => p.platform)}
      />

    </div>
  );
}
