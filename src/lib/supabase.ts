import { createClient } from '@supabase/supabase-js';

// Read configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Flags to indicate database configuration state
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Real Client Setup
let realClient: any = null;
if (isSupabaseConfigured) {
  try {
    realClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Failed to initialize official Supabase client:', err);
  }
}

// Custom EventEmitter to simulate Supabase real-time channel subscriptions
class AppRealtimeChannel {
  private eventListeners: { [event: string]: Function[] } = {};
  public topic: string;

  constructor(topic: string) {
    this.topic = topic;
  }

  public on(event: string, filter: any, callback: Function): this {
    const key = `${event}:${JSON.stringify(filter || {})}`;
    if (!this.eventListeners[key]) {
      this.eventListeners[key] = [];
    }
    this.eventListeners[key].push(callback);
    return this;
  }

  public subscribe(statusCallback?: (status: string) => void): this {
    if (statusCallback) {
      setTimeout(() => statusCallback('SUBSCRIBED'), 100);
    }
    return this;
  }

  public trigger(event: string, payload: any) {
    Object.keys(this.eventListeners).forEach((key) => {
      if (key.startsWith(event)) {
        this.eventListeners[key].forEach((cb) => cb({ payload }));
      }
    });
  }
}

const activeChannels: { [topic: string]: AppRealtimeChannel } = {};

// In-Memory Database store to keep track of state across login sessions for simulated demo
const mockDatabase = {
  users: [
    { id: 'usr-1', email: 'suprbuildllc@gmail.com', fullName: 'Marcus Johnson', tier: 'Pro' }
  ],
  earnings: [],
  reports: [],
  writeOffs: []
};

// Mock Supabase Client API
export const mockSupabase = {
  auth: {
    signUp: async ({ email, password, options }: any) => {
      const exists = mockDatabase.users.find(u => u.email === email);
      if (exists) {
        return { data: { user: null }, error: { message: 'User already exists' } };
      }
      const newUser = {
        id: `usr-${Math.random().toString(36).substr(2, 9)}`,
        email,
        fullName: options?.data?.full_name || email.split('@')[0],
        tier: 'Free' as const
      };
      mockDatabase.users.push(newUser);
      localStorage.setItem('krostio_user_session', JSON.stringify({
        email: newUser.email,
        fullName: newUser.fullName,
        tier: newUser.tier,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
        isCustomSupabase: false
      }));
      return { data: { user: newUser, session: { user: newUser } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const user = mockDatabase.users.find(u => u.email === email);
      if (!user) {
        // Auto-create for demo convenience to guarantee zero friction!
        const newUser = {
          id: 'usr-demo',
          email,
          fullName: 'Demo Practitioner',
          tier: 'Pro' as const
        };
        mockDatabase.users.push(newUser);
        localStorage.setItem('krostio_user_session', JSON.stringify({
          email: newUser.email,
          fullName: newUser.fullName,
          tier: newUser.tier,
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
          isCustomSupabase: false
        }));
        return { data: { user: newUser, session: { user: newUser } }, error: null };
      }
      const activeSession = {
        email: user.email,
        fullName: user.fullName,
        tier: user.tier,
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces`,
        isCustomSupabase: false
      };
      localStorage.setItem('krostio_user_session', JSON.stringify(activeSession));
      return { data: { user, session: { user } }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('krostio_user_session');
      return { error: null };
    },
    getSession: async () => {
      const str = localStorage.getItem('krostio_user_session');
      if (str) {
        try {
          return { data: { session: { user: JSON.parse(str) } } };
        } catch {
          return { data: { session: null } };
        }
      }
      return { data: { session: null } };
    },
    onAuthStateChange: (callback: any) => {
      // Simulate simple auth listener
      const handleStorageChange = () => {
        const sessionStr = localStorage.getItem('krostio_user_session');
        const sessionInstance = sessionStr ? JSON.parse(sessionStr) : null;
        callback(sessionInstance ? 'SIGNED_IN' : 'SIGNED_OUT', sessionInstance);
      };
      window.addEventListener('storage', handleStorageChange);
      return { data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handleStorageChange) } } };
    }
  },
  channel: (topic: string) => {
    if (!activeChannels[topic]) {
      activeChannels[topic] = new AppRealtimeChannel(topic);
    }
    return activeChannels[topic];
  },
  removeChannel: (channel: any) => {
    if (channel && channel.topic) {
      delete activeChannels[channel.topic];
    }
  },
  // Simple chained queries to mock database tables structures
  from: (table: string) => {
    return {
      select: (columns?: string) => {
        return {
          order: (col: string, options?: any) => {
            return {
              limit: (limit: number) => {
                return {
                  data: mockDatabase[table as keyof typeof mockDatabase] || [],
                  error: null
                };
              },
              data: mockDatabase[table as keyof typeof mockDatabase] || [],
              error: null
            };
          },
          data: mockDatabase[table as keyof typeof mockDatabase] || [],
          error: null
        };
      },
      insert: (record: any) => {
        if (!mockDatabase[table as keyof typeof mockDatabase]) {
          (mockDatabase as any)[table] = [];
        }
        (mockDatabase[table as keyof typeof mockDatabase] as any[]).push(record);
        
        // Broadcast through websocket channel mock
        const channel = activeChannels['realtime:earnings_feed'];
        if (channel && table === 'earnings') {
          channel.trigger('INSERT', record);
        }
        
        return { data: [record], error: null };
      }
    };
  }
};

// Provide global simulation trigger to send live events instantly
export function triggerLiveEarningSyncSimulation(platformName: string, amountValue: number) {
  const channel = activeChannels['realtime:earnings_feed'];
  if (channel) {
    const payload = {
      record: {
        id: `earn-${Math.random().toString(36).substr(2, 9)}`,
        platform: platformName,
        amount: amountValue,
        date: new Date().toISOString().substring(0, 7),
        verifiedBy: 'Argyle',
        argyleTimestamp: new Date().toISOString(),
        status: 'Growing',
        category: platformName === 'Uber' ? 'rideshare' : platformName === 'DoorDash' ? 'delivery' : 'freelance_tech'
      }
    };
    channel.trigger('INSERT', payload);
    return payload.record;
  }
  return null;
}

// Export active client depending on availability of variables for fully robust operational flow
export const supabase = isSupabaseConfigured ? realClient : mockSupabase;
export const getActiveBackendType = () => isSupabaseConfigured ? 'Direct Supabase Cloud Connection' : 'High-Fidelity Offline Sandbox';
