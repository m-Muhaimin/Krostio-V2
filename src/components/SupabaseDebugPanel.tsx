import React, { useState } from 'react';
import { Database, Terminal, Mail, Info, RefreshCcw, Settings, Key, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { EarningRecord, PlatformConnection, VerificationReport, TaxWriteOff, UserSession, SyncEvent } from '../types';

interface SupabaseDebugPanelProps {
  currentSession: UserSession;
  platforms: PlatformConnection[];
  earnings: EarningRecord[];
  reports: VerificationReport[];
  writeOffs: TaxWriteOff[];
  syncLogs: SyncEvent[];
  resendEmails: any[];
  isCustomSupabase: boolean;
  onToggleCustomSupabase: (url: string, key: string) => void;
  onClearSandbox: () => void;
}

export default function SupabaseDebugPanel({
  currentSession,
  platforms,
  earnings,
  reports,
  writeOffs,
  syncLogs,
  resendEmails,
  isCustomSupabase,
  onToggleCustomSupabase,
  onClearSandbox
}: SupabaseDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTable, setActiveTable] = useState<'users' | 'earnings' | 'reports' | 'write_offs' | 'resend_logs'>('earnings');
  
  // Custom inputs for actual Supabase configuration keys (optional)
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  const handleApplyKeys = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl || !customKey) return;
    onToggleCustomSupabase(customUrl, customKey);
  };

  return (
    <div className={`fixed bottom-0 right-0 left-0 bg-[#0a0c0a] text-gray-200 border-t border-[#1a1f1a] z-40 transition-all font-mono duration-300 ${
      isOpen ? 'h-[360px]' : 'h-[36px]'
    }`}>
      
      {/* Console drawer header bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0c0e0c] px-5 py-2 flex items-center justify-between cursor-pointer border-b border-[#1b1f1b] select-none"
      >
        <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase text-emerald-400">
          <div className="w-4.5 h-4.5 bg-[#142b18] text-[#00FF66] border border-[#00FF66]/20 rounded-sm flex items-center justify-center shadow-xs shrink-0">
            <Terminal size={11} className="stroke-[2.5] text-[#00FF55]" />
          </div>
          <span className="text-[#00FF55] text-[10px] font-bold font-mono tracking-wider">SUPABASE REALTIME SYNC & CREDENTIALS</span>
          <span className="h-3.5 w-0.5 bg-[#00FF55]/30"></span>
          <span className="text-zinc-400 text-[10px] font-medium font-mono tracking-wider">
            SANDBOX DESIGN PLATFORM (FULLY INTERACTIVE OFFLINE
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
          <span>{isOpen ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND'}</span>
        </div>
      </div>

      {/* Panel inner configuration */}
      {isOpen && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 h-[324px] overflow-hidden">
          
          {/* Column 1: Config settings & Resend / Paddle state details */}
          <div className="md:col-span-4 border-r border-gray-800 pr-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Settings size={12} className="text-gray-400" />
                <h4 className="font-bold text-3xs uppercase text-gray-300 tracking-wider">Configure Cloud Keys</h4>
              </div>

              {isCustomSupabase ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-3xs text-emerald-300 space-y-1.5 leading-normal">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck size={12} />
                    <span>Real production keys injected OK!</span>
                  </div>
                  <p className="text-emerald-400/80">
                    Krostio is successfully routing write-offs, sessions, auth states, and earnings through your personal Supabase production cluster.
                  </p>
                  <button
                    onClick={() => onToggleCustomSupabase('', '')}
                    className="mt-2 text-red-400 hover:underline font-bold text-[9px] uppercase tracking-wider block"
                  >
                    Disconnect Cloud Server Settings
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyKeys} className="space-y-2 text-3xs">
                  <p className="text-gray-400 text-3xs leading-relaxed mb-2 font-sans">
                    Defaulting to high-fidelity simulated Sandbox mode. Input configurations below to route data through your active cloud database:
                  </p>
                  <div>
                    <input
                      type="text"
                      required
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="SUPABASE_URL (https://...)"
                      className="w-full bg-gray-950 border border-gray-800 px-2 py-1 text-[10px] focus:outline-hidden text-emerald-400 rounded"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      required
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="SUPABASE_ANON_KEY (eyJhb...)"
                      className="w-full bg-gray-950 border border-gray-800 px-2 py-1 text-[10px] focus:outline-hidden text-emerald-400 rounded"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold uppercase rounded text-[9px] tracking-wider transition-colors cursor-pointer"
                  >
                    Sync Live Supabase Connection
                  </button>
                </form>
              )}
            </div>

            <div className="pt-3 border-t border-gray-850 text-3xs space-y-1.5 leading-relaxed text-gray-400 font-sans">
              <div className="flex items-center gap-1 font-mono font-bold text-gray-300 text-3xs">
                <span>⚡ Integrations Sandbox Handshake</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Paddle payments integration:</span>
                <span className="text-emerald-400 font-bold">Active sandbox</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Resend email module:</span>
                <span className="text-emerald-400 font-bold">Logger monitor ready</span>
              </div>
              <button
                onClick={onClearSandbox}
                className="text-red-400 hover:underline font-mono text-[9px] uppercase tracking-wider block"
              >
                Reset Sandbox Cache
              </button>
            </div>
          </div>

          {/* Column 2: Memory Database rows viewer tables */}
          <div className="md:col-span-8 flex flex-col h-full overflow-hidden">
            {/* Table selectors */}
            <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-850 text-[10px] mb-3">
              <button
                onClick={() => setActiveTable('earnings')}
                className={`flex-1 py-1 text-center font-bold tracking-wider rounded uppercase transition-all ${
                  activeTable === 'earnings' ? 'bg-gray-850 text-emerald-400' : 'text-gray-400'
                }`}
              >
                earnings db ({earnings.length})
              </button>
              <button
                onClick={() => setActiveTable('reports')}
                className={`flex-1 py-1 text-center font-bold tracking-wider rounded uppercase transition-all ${
                  activeTable === 'reports' ? 'bg-gray-850 text-emerald-400' : 'text-gray-400'
                }`}
              >
                reports table ({reports.length})
              </button>
              <button
                onClick={() => setActiveTable('write_offs')}
                className={`flex-1 py-1 text-center font-bold tracking-wider rounded uppercase transition-all ${
                  activeTable === 'write_offs' ? 'bg-gray-850 text-emerald-400' : 'text-gray-400'
                }`}
              >
                write_offs ({writeOffs.length})
              </button>
              <button
                onClick={() => setActiveTable('resend_logs')}
                className={`flex-1 py-1 text-center font-bold tracking-wider rounded uppercase transition-all ${
                  activeTable === 'resend_logs' ? 'bg-gray-850 text-emerald-400' : 'text-gray-400'
                }`}
              >
                resend logs ({resendEmails.length})
              </button>
            </div>

            {/* Display JSON/Row Data */}
            <div className="flex-1 bg-gray-950 border border-gray-850 rounded-xl p-3 overflow-y-auto text-3xs select-all text-emerald-400/90 whitespace-pre scrollbar-thin">
              {activeTable === 'earnings' && (
                JSON.stringify(earnings.map(e => ({ id: e.id, platform: e.platform, amount: e.amount, date: e.date, verified: e.verifiedBy })), null, 2)
              )}
              {activeTable === 'reports' && (
                JSON.stringify(reports.map(r => ({ id: r.id, name: r.reportName, useCase: r.useCase, code: r.argyleVerificationId, token: r.shareToken })), null, 2)
              )}
              {activeTable === 'write_offs' && (
                JSON.stringify(writeOffs.map(w => ({ id: w.id, label: w.label, amount: w.amount, category: w.category })), null, 2)
              )}
              {activeTable === 'resend_logs' && (
                resendEmails.length === 0 ? (
                  <span className="text-gray-500 italic">No Resend emails dispatched yet... (Triggers upon premium billing checkout or sharing)</span>
                ) : (
                  resendEmails.map((email, idx) => (
                    <div key={idx} className="border-b border-gray-850 pb-2 mb-2 last:border-0 text-[10px]">
                      <div className="text-gray-400 font-bold flex gap-2">
                        <span>[RESEND DELIVERY: SENT OK]</span>
                        <span>{email.timestamp}</span>
                      </div>
                      <div className="text-white mt-1 flex justify-between font-sans">
                        <span>Subject: {email.subject}</span>
                        <span>Recipient: {email.recipient}</span>
                      </div>
                      <div className="text-gray-500 font-sans mt-1 bg-gray-900 p-1.5 rounded" dangerouslySetInnerHTML={{ __html: email.body }}></div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
