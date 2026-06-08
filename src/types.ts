export interface EarningRecord {
  id: string;
  platform: 'Uber' | 'DoorDash' | 'Upwork' | 'Fiverr' | 'Lyft' | 'Instacart';
  amount: number;
  date: string;
  verifiedBy: 'Argyle';
  argyleTimestamp: string;
  status: 'Growing' | 'Stable' | 'Seasonal' | 'Declining';
  category: 'rideshare' | 'delivery' | 'freelance_tech' | 'freelance_creative';
}

export interface PlatformConnection {
  platform: 'Uber' | 'DoorDash' | 'Upwork' | 'Fiverr' | 'Lyft' | 'Instacart';
  status: 'connected' | 'disconnected' | 'syncing';
  lastSynced: string;
  totalEarnings: number;
  tenureMonths: number;
  icon: string;
}

export interface VerificationReport {
  id: string;
  reportName: string;
  useCase: 'Mortgage Application' | 'Rental Application' | 'Personal Loan' | 'Tax Preparation' | 'Custom';
  dateRange: string;
  generatedAt: string;
  validThrough: string;
  includeStabilityScore: boolean;
  includeTaxMatch: boolean;
  notes?: string;
  argyleVerificationId: string;
  shareToken: string;
  status: 'Active' | 'Revoked';
}

export interface TaxWriteOff {
  id: string;
  label: string;
  amount: number;
  category: 'Mileage' | 'Platform Fees' | 'Internet & Phone' | 'Equipment' | 'Other';
  date: string;
}

export interface SyncEvent {
  id: string;
  timestamp: string;
  platform: string;
  amount: number;
  type: 'earning_sync' | 'connection_created' | 'webhook_trigger';
  details: string;
}

export interface UserSession {
  email: string;
  fullName: string;
  tier: 'Free' | 'Pro' | 'Pro+';
  avatarUrl: string;
  isCustomSupabase: boolean;
}
