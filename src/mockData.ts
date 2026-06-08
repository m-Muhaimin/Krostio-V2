import { EarningRecord, PlatformConnection, VerificationReport, TaxWriteOff, SyncEvent } from './types';

export const INITIAL_PLATFORMS: PlatformConnection[] = [
  {
    platform: 'Uber',
    status: 'connected',
    lastSynced: 'Today at 10:30 AM',
    totalEarnings: 28500,
    tenureMonths: 38,
    icon: '🚗'
  },
  {
    platform: 'DoorDash',
    status: 'connected',
    lastSynced: 'Today at 10:32 AM',
    totalEarnings: 24300,
    tenureMonths: 25,
    icon: '🍔'
  },
  {
    platform: 'Upwork',
    status: 'connected',
    lastSynced: 'Today at 10:28 AM',
    totalEarnings: 14650,
    tenureMonths: 22,
    icon: '💼'
  }
];

export const AVAILABLE_ARGYLE_PLATFORMS = [
  { name: 'Uber', category: 'gig_driving', icon: '🚗', popularity: 'High', coverage: 'Global' },
  { name: 'DoorDash', category: 'delivery', icon: '🍔', popularity: 'High', coverage: 'Global' },
  { name: 'Upwork', category: 'freelance', icon: '💼', popularity: 'High', coverage: 'Global' },
  { name: 'Fiverr', category: 'freelance', icon: '🎨', popularity: 'Medium', coverage: 'Global' },
  { name: 'Lyft', category: 'gig_driving', icon: '🚙', popularity: 'High', coverage: 'US/CA' },
  { name: 'Instacart', category: 'delivery', icon: '🥕', popularity: 'High', coverage: 'US/CA' }
];

export const INITIAL_EARNINGS: EarningRecord[] = [
  // 2026 Monthly Summary aggregates
  { id: '1', platform: 'Uber', amount: 2400, date: '2026-05', verifiedBy: 'Argyle', argyleTimestamp: '2026-06-08T10:30:00Z', status: 'Growing', category: 'rideshare' },
  { id: '2', platform: 'DoorDash', amount: 2100, date: '2026-05', verifiedBy: 'Argyle', argyleTimestamp: '2026-06-08T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '3', platform: 'Upwork', amount: 1500, date: '2026-05', verifiedBy: 'Argyle', argyleTimestamp: '2026-06-08T10:28:00Z', status: 'Growing', category: 'freelance_tech' },

  { id: '4', platform: 'Uber', amount: 2600, date: '2026-04', verifiedBy: 'Argyle', argyleTimestamp: '2026-05-01T10:30:00Z', status: 'Growing', category: 'rideshare' },
  { id: '5', platform: 'DoorDash', amount: 1950, date: '2026-04', verifiedBy: 'Argyle', argyleTimestamp: '2026-05-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '6', platform: 'Upwork', amount: 1200, date: '2026-04', verifiedBy: 'Argyle', argyleTimestamp: '2026-05-01T10:28:00Z', status: 'Growing', category: 'freelance_tech' },

  { id: '7', platform: 'Uber', amount: 2300, date: '2026-03', verifiedBy: 'Argyle', argyleTimestamp: '2026-04-01T10:30:00Z', status: 'Growing', category: 'rideshare' },
  { id: '8', platform: 'DoorDash', amount: 2050, date: '2026-03', verifiedBy: 'Argyle', argyleTimestamp: '2026-04-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '9', platform: 'Upwork', amount: 1600, date: '2026-03', verifiedBy: 'Argyle', argyleTimestamp: '2026-04-01T10:28:00Z', status: 'Growing', category: 'freelance_tech' },

  { id: '10', platform: 'Uber', amount: 2100, date: '2026-02', verifiedBy: 'Argyle', argyleTimestamp: '2026-03-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '11', platform: 'DoorDash', amount: 2200, date: '2026-02', verifiedBy: 'Argyle', argyleTimestamp: '2026-03-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '12', platform: 'Upwork', amount: 1100, date: '2026-02', verifiedBy: 'Argyle', argyleTimestamp: '2026-03-01T10:28:00Z', status: 'Stable', category: 'freelance_tech' },

  { id: '13', platform: 'Uber', amount: 2500, date: '2026-01', verifiedBy: 'Argyle', argyleTimestamp: '2026-02-01T10:30:00Z', status: 'Growing', category: 'rideshare' },
  { id: '14', platform: 'DoorDash', amount: 1800, date: '2026-01', verifiedBy: 'Argyle', argyleTimestamp: '2026-02-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '15', platform: 'Upwork', amount: 1400, date: '2026-01', verifiedBy: 'Argyle', argyleTimestamp: '2026-02-01T10:28:00Z', status: 'Growing', category: 'freelance_tech' },

  // 2025 Summary aggregates
  { id: '16', platform: 'Uber', amount: 2200, date: '2025-12', verifiedBy: 'Argyle', argyleTimestamp: '2026-01-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '17', platform: 'DoorDash', amount: 2000, date: '2025-12', verifiedBy: 'Argyle', argyleTimestamp: '2026-01-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '18', platform: 'Upwork', amount: 1300, date: '2025-12', verifiedBy: 'Argyle', argyleTimestamp: '2026-01-01T10:28:00Z', status: 'Stable', category: 'freelance_tech' },

  { id: '19', platform: 'Uber', amount: 2000, date: '2025-11', verifiedBy: 'Argyle', argyleTimestamp: '2025-12-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '20', platform: 'DoorDash', amount: 1700, date: '2025-11', verifiedBy: 'Argyle', argyleTimestamp: '2025-12-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '21', platform: 'Upwork', amount: 950, date: '2025-11', verifiedBy: 'Argyle', argyleTimestamp: '2025-12-01T10:28:00Z', status: 'Stable', category: 'freelance_tech' },

  { id: '22', platform: 'Uber', amount: 1900, date: '2025-10', verifiedBy: 'Argyle', argyleTimestamp: '2025-11-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '23', platform: 'DoorDash', amount: 2250, date: '2025-10', verifiedBy: 'Argyle', argyleTimestamp: '2025-11-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '24', platform: 'Upwork', amount: 800, date: '2025-10', verifiedBy: 'Argyle', argyleTimestamp: '2025-11-01T10:28:00Z', status: 'Stable', category: 'freelance_tech' },

  { id: '25', platform: 'Uber', amount: 2500, date: '2025-09', verifiedBy: 'Argyle', argyleTimestamp: '2025-10-01T10:30:00Z', status: 'Growing', category: 'rideshare' },
  { id: '26', platform: 'DoorDash', amount: 1900, date: '2025-09', verifiedBy: 'Argyle', argyleTimestamp: '2025-10-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '27', platform: 'Upwork', amount: 1100, date: '2025-09', verifiedBy: 'Argyle', argyleTimestamp: '2025-10-01T10:28:00Z', status: 'Growing', category: 'freelance_tech' },

  { id: '28', platform: 'Uber', amount: 2400, date: '2025-08', verifiedBy: 'Argyle', argyleTimestamp: '2025-09-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '29', platform: 'DoorDash', amount: 2150, date: '2025-08', verifiedBy: 'Argyle', argyleTimestamp: '2025-09-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '30', platform: 'Upwork', amount: 1350, date: '2025-08', verifiedBy: 'Argyle', argyleTimestamp: '2025-09-01T10:28:00Z', status: 'Growing', category: 'freelance_tech' },

  { id: '31', platform: 'Uber', amount: 2100, date: '2025-07', verifiedBy: 'Argyle', argyleTimestamp: '2025-08-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '32', platform: 'DoorDash', amount: 2100, date: '2025-07', verifiedBy: 'Argyle', argyleTimestamp: '2025-08-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '33', platform: 'Upwork', amount: 1200, date: '2025-07', verifiedBy: 'Argyle', argyleTimestamp: '2025-08-01T10:28:00Z', status: 'Stable', category: 'freelance_tech' },

  { id: '34', platform: 'Uber', amount: 2200, date: '2025-06', verifiedBy: 'Argyle', argyleTimestamp: '2025-07-01T10:30:00Z', status: 'Stable', category: 'rideshare' },
  { id: '35', platform: 'DoorDash', amount: 2150, date: '2025-06', verifiedBy: 'Argyle', argyleTimestamp: '2025-07-01T10:32:00Z', status: 'Stable', category: 'delivery' },
  { id: '36', platform: 'Upwork', amount: 1050, date: '2025-06', verifiedBy: 'Argyle', argyleTimestamp: '2025-07-01T10:28:00Z', status: 'Stable', category: 'freelance_tech' }
];

export const INITIAL_REPORTS: VerificationReport[] = [
  {
    id: '1',
    reportName: 'Primary Mortgage Verification Report',
    useCase: 'Mortgage Application',
    dateRange: 'Past 12 Months (June 2025 - May 2026)',
    generatedAt: '2026-06-08T10:45:00Z',
    validThrough: '2026-07-08T10:45:00Z',
    includeStabilityScore: true,
    includeTaxMatch: true,
    notes: 'Generating certified proof of income for Wells Fargo mortgage application underwriting. Direct connection verified through Argyle API.',
    argyleVerificationId: 'ARY-2026-789456',
    shareToken: 'kro_report_m_82937a',
    status: 'Active'
  },
  {
    id: '2',
    reportName: 'Tax Audit income Statement',
    useCase: 'Tax Preparation',
    dateRange: 'Full Year 2025',
    generatedAt: '2026-02-15T14:10:00Z',
    validThrough: '2026-12-31T00:00:00Z',
    includeStabilityScore: false,
    includeTaxMatch: true,
    notes: 'Consolidated gig economy income direct extraction for Schedule C filing preparation.',
    argyleVerificationId: 'ARY-2025-104928',
    shareToken: 'kro_report_t_04918f',
    status: 'Active'
  }
];

export const INITIAL_WRITE_OFFS: TaxWriteOff[] = [
  { id: '1', label: 'Standard mileage allowance (2,450 mi)', amount: 1641.50, category: 'Mileage', date: '2026-05-30' },
  { id: '2', label: 'Uber platform fee deductions', amount: 890.00, category: 'Platform Fees', date: '2026-05-31' },
  { id: '3', label: 'Main phone plan & 5G link (50% business use)', amount: 480.00, category: 'Internet & Phone', date: '2026-05-15' },
  { id: '4', label: 'Delivery storage equipment & thermal bags', amount: 124.99, category: 'Equipment', date: '2026-04-10' },
  { id: '5', label: 'Custom Upwork client fees', amount: 245.00, category: 'Platform Fees', date: '2026-05-25' }
];

export const INITIAL_SYNC_LOGS: SyncEvent[] = [
  { id: '1', timestamp: '14:32:02', platform: 'DoorDash', amount: 18.50, type: 'earning_sync', details: 'Direct payout webhook received and verified.' },
  { id: '2', timestamp: '14:30:11', platform: 'Uber', amount: 34.20, type: 'earning_sync', details: 'Completed ride ID #829188 synchronized via Argyle.' },
  { id: '3', timestamp: '14:28:45', platform: 'Upwork', amount: 450.00, type: 'earning_sync', details: 'Milestone payment #2 released and verified.' },
  { id: '4', timestamp: '11:15:30', platform: 'Global', amount: 0, type: 'connection_created', details: 'Argyle sync session established successfully.' }
];
