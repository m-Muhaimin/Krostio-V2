import React, { useState } from 'react';
import { FileText, Plus, ShieldCheck, Mail, ClipboardCheck, Eye, EyeOff, Loader2, Sparkles, Check, Link, Trash2, Globe } from 'lucide-react';
import { VerificationReport, PlatformConnection, EarningRecord } from '../types';

interface ReportsTabProps {
  reports: VerificationReport[];
  platforms: PlatformConnection[];
  earnings: EarningRecord[];
  onGenerateReport: (newReport: Omit<VerificationReport, 'id' | 'generatedAt' | 'validThrough' | 'argyleVerificationId' | 'shareToken' | 'status'>) => void;
  onDeleteReport: (id: string) => void;
  onOpenPublicLink: (shareToken: string) => void;
  userEmail: string;
}

export default function ReportsTab({
  reports,
  platforms,
  earnings,
  onGenerateReport,
  onDeleteReport,
  onOpenPublicLink,
  userEmail
}: ReportsTabProps) {
  // Creator form state
  const [reportName, setReportName] = useState('Income Verification Ledger - Chase Mortgage');
  const [useCase, setUseCase] = useState<VerificationReport['useCase']>('Mortgage Application');
  const [dateRange, setDateRange] = useState('Past 12 Months (June 2025 - May 2026)');
  const [includeStability, setIncludeStability] = useState(true);
  const [includeTax, setIncludeTax] = useState(true);
  const [notes, setNotes] = useState('Generating direct payout validation for Chase Bank mortgage loan underwriter. Verified via real-time Argyle network gateways.');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active viewer PDF selection
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  // Group last 12 months earnings aggregate
  const totalEarningsAmt = earnings.reduce((sum, item) => sum + item.amount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      onGenerateReport({
        reportName,
        useCase,
        dateRange,
        includeStabilityScore: includeStability,
        includeTaxMatch: includeTax,
        notes: notes || undefined
      });
      setIsGenerating(false);
      setNotes('');
    }, 1100);
  };

  const copyShareLink = (token: string, id: string) => {
    const fullUrl = `${window.location.origin}/report/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left panel: Report configurations and history list */}
      <div className="lg:col-span-4 space-y-6 flex flex-col">
        
        {/* Creator panel */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs">
          <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] mb-3">Verification Compiler</h3>
          
          <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
            
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1">Report Display Name</label>
              <input
                type="text"
                required
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g. Mortgage Verification Ledger - Wells Fargo"
                className="w-full px-3 py-2 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden focus:border-cohere-green text-[#1c1b18] font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1">Use Case</label>
                <select
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-[10px] bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-sans"
                >
                  <option value="Mortgage Application">Mortgage Loan</option>
                  <option value="Rental Application">Rental Lease</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Tax Preparation">CPA / Tax Prep</option>
                  <option value="Custom">Custom Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1">Audit Span</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-2.5 py-2 text-[10px] bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-sans"
                >
                  <option value="Past 12 Months (June 2025 - May 2026)">Past 12 Months</option>
                  <option value="Past 24 Months (June 2024 - May 2026)">Past 24 Months</option>
                  <option value="Full Year 2025 (Jan - Dec 2025)">Full Year 2025</option>
                </select>
              </div>
            </div>

            {/* Custom switches toggles with pristine spacing */}
            <div className="space-y-2 border-t border-b border-cohere-stone py-3 text-[10px]">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="font-bold text-[#4e4c45] uppercase tracking-wider font-mono text-[9px] group-hover:text-[#1c1b18] select-none">Include stability coefficient</span>
                <input
                  type="checkbox"
                  checked={includeStability}
                  onChange={(e) => setIncludeStability(e.target.checked)}
                  className="w-4 h-4 accent-cohere-green rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="font-bold text-[#4e4c45] uppercase tracking-wider font-mono text-[9px] group-hover:text-[#1c1b18] select-none font-sans">Include tax transcript sync</span>
                <input
                  type="checkbox"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="w-4 h-4 accent-cohere-green rounded cursor-pointer"
                />
              </label>
            </div>

            <div>
              <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1">Reviewer Letters (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe additional context for the loan officer or reviewer..."
                className="w-full min-h-[60px] px-3 py-2 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden focus:border-cohere-green text-[#1c1b18] font-sans leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2 bg-cohere-green hover:bg-cohere-forest text-cohere-cream text-xs font-mono font-bold uppercase tracking-widest rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cohere-sage" />
                  Generating Transcript...
                </>
              ) : (
                <>
                  <Sparkles size={12} className="text-cohere-sage" />
                  Compile PDF Document
                </>
              )}
            </button>
          </form>
        </div>

        {/* History reports list */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 flex-1 select-none shadow-3xs">
          <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] mb-1">Verification Ledger</h3>
          <p className="text-[10px] text-[#4e4c45] mb-4 font-sans leading-relaxed">
            Active verification credentials. Select any item to display the simulated A4 page format or issue cryptographic transmission URLs.
          </p>

          <div className="space-y-2">
            {reports.map((rep) => {
              const isActive = rep.id === selectedReportId;
              return (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-cohere-sand/60 border-cohere-green shadow-xs' 
                      : 'bg-[#fffdfa] border-cohere-stone hover:border-cohere-clay'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold text-[#1c1b18] line-clamp-1 truncate font-serif italic">{rep.reportName}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(rep.id);
                      }}
                      className="p-1 text-[#4e4c45] hover:text-rose-700 rounded transition-colors cursor-pointer"
                      title="Revoke PDF security"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-[#4e4c45] mt-2 font-mono">
                    <span className="font-bold uppercase tracking-widest bg-cohere-sand px-2 py-0.5 border border-cohere-stone rounded-sm text-[8px]">{rep.useCase.split(' ')[0]}</span>
                    <span>No: {rep.argyleVerificationId}</span>
                  </div>

                  {/* Copy Share Utilities */}
                  <div className="flex items-center gap-1.5 mt-3 border-t border-cohere-stone pt-2.5 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShareLink(rep.shareToken, rep.id);
                      }}
                      className="text-[9px] font-bold font-mono text-cohere-green bg-[#e8efea] hover:bg-[#d8e0da] border border-cohere-green/10 px-2 py-0.5 rounded-sm flex items-center gap-1 transition-all cursor-pointer uppercase"
                    >
                      {copiedId === rep.id ? <Check size={10} className="stroke-[3]" /> : <Link size={10} />}
                      {copiedId === rep.id ? 'Copied' : 'Access Link'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPublicLink(rep.shareToken);
                      }}
                      className="text-[9px] font-bold font-mono text-[#4e4c45] bg-cohere-sand hover:bg-cohere-stone/40 border border-cohere-stone px-2 py-0.5 rounded-sm flex items-center gap-1 transition-all cursor-pointer uppercase"
                    >
                      <Globe size={10} /> Public
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right panel: High-Fidelity Paper PDF Viewer document rendering */}
      <div className="lg:col-span-8">
        {activeReport ? (
          <div className="space-y-4">
            
            {/* Control action bar for document */}
            <div className="bg-white border border-cohere-clay rounded-xl p-3 flex justify-between items-center text-xs shadow-3xs">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cohere-green animate-pulse"></span>
                <span className="font-bold text-[#1c1b18] font-serif italic">Verification Statement Panel:</span>
                <span className="font-mono text-[9px] text-cohere-light-ink font-bold bg-[#e8efea] border border-cohere-green/10 px-2 py-0.5 rounded uppercase">Active Seal</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyShareLink(activeReport.shareToken, activeReport.id)}
                  className="px-3.5 py-1.5 bg-cohere-green hover:bg-cohere-forest text-cohere-cream font-mono font-bold rounded-md shadow-xs transition-all flex items-center gap-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                >
                  {copiedId === activeReport.id ? <Check size={11} className="stroke-[3]" /> : <Link size={11} />}
                  Copy Verification URL
                </button>
              </div>
            </div>

            {/* Virtual A4 Paper Report Display Sheet */}
            <div className="bg-[#fffdfa] border border-cohere-clay shadow-lg rounded-xl overflow-hidden p-8 md:p-12 max-w-4xl mx-auto font-sans relative select-text">
              <div className="absolute right-0 top-0 w-24 h-24 overflow-hidden pointer-events-none">
                <div className="bg-[#e8efea] border-cohere-green/20 border text-cohere-green uppercase font-mono font-bold text-center py-1 text-[8px] tracking-widest rotate-45 transform translate-x-7 translate-y-4 w-32 border-b-2">
                  VERIFIED
                </div>
              </div>

              {/* REPORT LOGOS / TITLE HEADER */}
              <div className="flex justify-between items-start border-b border-[#1c1b18] pb-5 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic font-bold tracking-tight text-lg text-[#1c1b18] leading-none">Krostio ID</span>
                    <span className="text-[#4e4c45] text-[9px] font-mono tracking-widest font-bold uppercase">// CERTIFIED LEDGER</span>
                  </div>
                  <h1 className="text-xl font-serif italic font-medium text-[#1c1b18] tracking-tight mt-3">Verified Earnings Transcript</h1>
                  <span className="inline-block text-[9px] uppercase tracking-wider text-cohere-light-ink bg-cohere-sand px-2 py-0.5 rounded border border-cohere-stone font-mono mt-1">DIRECT API INGEST • ENCRYPTED GATEWAY</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold bg-[#1c1b18] text-[#fffdfa] px-3 py-1 rounded uppercase tracking-wider">LENDER HANDSHAKE</span>
                  <div className="mt-4 text-[9px] font-mono text-[#4e4c45] flex flex-col gap-0.5 text-right font-bold uppercase">
                    <span>Ledger Code: <strong className="text-[#1c1b18]">KRO-{activeReport.id}-{Math.floor(1000 + Math.random() * 9000)}</strong></span>
                    <span>Issue Block: <strong className="text-[#1c1b18]">{new Date(activeReport.generatedAt).toLocaleDateString()}</strong></span>
                    <span>Valid Date: <strong className="text-[#1c1b18]">{new Date(activeReport.validThrough).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* STAGES INFO BLOCK */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-[11px]">
                <div className="p-4 bg-white rounded-lg border border-cohere-stone">
                  <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-mono font-bold block mb-1.5">Subject Professional Profile</span>
                  <table className="w-full text-[#4e4c45] space-y-1 font-sans">
                    <tbody>
                      <tr className="border-b border-[#f0eee4] pb-1.5">
                        <td className="text-[#4e4c45] font-normal pb-1">Full Name</td>
                        <td className="text-right text-[#1c1b18] pb-1 font-semibold">Marcus Johnson</td>
                      </tr>
                      <tr className="border-b border-[#f0eee4] py-1.5">
                        <td className="text-[#4e4c45] font-normal py-1">Registered Address</td>
                        <td className="text-right text-[#1c1b18] py-1 font-mono">{userEmail}</td>
                      </tr>
                      <tr>
                        <td className="text-[#4e4c45] font-normal pt-1">Active Channels</td>
                        <td className="text-right text-[#1c1b18] pt-1 font-semibold">{platforms.length} Nodes Authenticated</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-white rounded-lg border border-cohere-stone font-sans">
                  <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-mono font-bold block mb-1.5">Institutional Access Handshake</span>
                  <table className="w-full text-[#4e4c45] space-y-1">
                    <tbody>
                      <tr className="border-b border-[#f0eee4] pb-1.5">
                        <td className="text-[#4e4c45] font-normal pb-1">Verification Agent</td>
                        <td className="text-right text-cohere-green pb-1 font-mono font-bold flex items-center justify-end gap-1">
                          <Check size={11} className="text-cohere-green stroke-[2.5]" /> Argyle Protocol Link
                        </td>
                      </tr>
                      <tr className="border-b border-[#f0eee4] py-1.5">
                        <td className="text-[#4e4c45] font-normal py-1">Underwriting Class</td>
                        <td className="text-right text-[#1c1b18] py-1 font-semibold">{activeReport.useCase}</td>
                      </tr>
                      <tr>
                        <td className="text-[#4e4c45] font-normal pt-1">Direct Auth Hash</td>
                        <td className="text-right text-[#1c1b18] pt-1 font-mono text-[9px] font-bold">{activeReport.argyleVerificationId}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SYSTEM LEVEL CONFIDENCE BLOCK */}
              <div className="border border-cohere-green/20 bg-[#e8efea]/30 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 font-mono">
                <div className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 bg-cohere-green text-cohere-cream rounded flex items-center justify-center font-bold text-xs select-none">OK</div>
                  <div>
                    <h4 className="font-bold text-xs text-[#1c1b18] tracking-wider uppercase">
                      Argyle Verified API Ledger Stream
                    </h4>
                    <p className="text-[10px] text-[#4e4c45] leading-relaxed font-sans mt-1">
                      Structured payout data parsed from payroll authorities via end-to-end encrypted link tokens.
                    </p>
                  </div>
                </div>
                <div className="text-left md:text-right font-mono">
                  <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-bold block">Verification Trust Rating</span>
                  <span className="text-lg font-bold text-cohere-green">99 / 100</span>
                </div>
              </div>

              {/* PLATFORM BREAKDOWNS SEGMENT */}
              <div className="mb-6 font-sans">
                <h3 className="text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold mb-2 font-mono">Active Account Nodes</h3>
                <div className="border border-cohere-stone rounded-lg overflow-hidden shadow-3xs bg-white">
                  <table className="w-full text-left border-collapse text-[11px] leading-relaxed">
                    <thead>
                      <tr className="bg-cohere-sand/60 border-b border-cohere-stone text-[9px] uppercase font-bold text-[#4e4c45] font-mono">
                        <th className="px-4 py-2.5 font-bold">Integrated Source</th>
                        <th className="px-4 py-2.5 text-right font-bold">Total Cash Earnings</th>
                        <th className="px-4 py-2.5 text-right font-bold">Last Synced Date</th>
                        <th className="px-4 py-2.5 text-right font-bold">Match Verification</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#1c1b18]" style={{ fontWeight: 450 }}>
                      {platforms.map((p, index) => (
                        <tr key={index} className="border-b border-[#f0eee4] last:border-0 hover:bg-[#fffdfa] transition-colors">
                          <td className="px-4 py-2.5 flex items-center gap-2">
                            <span className="text-base bg-cohere-cream w-7 h-7 rounded flex items-center justify-center border border-cohere-stone">{p.icon}</span>
                            <span className="font-bold text-[#1c1b18]">{p.platform} Ledger</span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold">${p.totalEarnings.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-[#4e4c45]">{p.lastSynced.replace('Today at ', '')}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="text-cohere-green bg-[#e8efea] border border-cohere-green/10 rounded-sm text-[8px] font-bold py-0.5 px-2 uppercase tracking-widest font-mono">VERIFIED MATCH</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center bg-white border border-cohere-stone px-4 py-3 mt-3 rounded-lg shadow-3xs">
                  <span className="uppercase text-[8px] tracking-wider text-[#4e4c45] font-mono font-bold">Aggregate Combined Income</span>
                  <span className="text-sm font-mono font-bold text-[#1c1b18]">${totalEarningsAmt.toLocaleString()}</span>
                </div>
              </div>

              {/* DTI STABILITY SECTION */}
              {activeReport.includeStabilityScore && (
                <div className="mb-5 p-4 border border-cohere-stone rounded-lg bg-cohere-sand/30">
                  <h3 className="text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold mb-1.5 font-mono">Stability Index Coefficient</h3>
                  <div className="flex items-center justify-between gap-4 flex-wrap text-[10px]">
                    <p className="text-[10px] text-[#4e4c45] max-w-md font-sans leading-relaxed">
                      Assesses monthly deposits stability index to verify optimal Fannie Mae debt-to-income servicing thresholds.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-cohere-green font-bold text-[10px] font-mono uppercase tracking-wider">Optimal profile</span>
                      <span className="text-xs font-bold font-mono text-[#1c1b18] bg-white border border-cohere-stone px-2 py-0.5 rounded">95%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAX MATCH SECTION */}
              {activeReport.includeTaxMatch && (
                <div className="mb-5 p-4 border border-cohere-green/20 rounded-lg bg-[#e8efea]/10 font-sans">
                  <h3 className="text-[9px] uppercase tracking-wider text-cohere-green font-bold mb-1.5 font-mono">Tax Schedule Reconciliation (Form 1040)</h3>
                  <div className="flex justify-between items-center bg-white border border-cohere-stone rounded-lg p-3 text-[10px] flex-wrap gap-2">
                    <div className="text-[#4e4c45] space-y-1">
                      <div>Total Verified Receipts (Argyle): <strong className="text-[#1c1b18] font-mono">${totalEarningsAmt.toLocaleString()}</strong></div>
                      <div>Form 1040 Schedule C Filing Reference: <strong className="text-cohere-green font-mono">${totalEarningsAmt.toLocaleString()}</strong></div>
                    </div>
                    <div className="text-right font-mono text-[8px] uppercase tracking-wider">
                      <span className="text-cohere-green font-bold block">Match verified</span>
                      <span className="text-[#4e4c45] block mt-0.5">Sec. 4506-C equivalent</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LENDER NOTES BOX */}
              {activeReport.notes && (
                <div className="mb-6">
                  <h3 className="text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold mb-1 font-mono">Verification Comments</h3>
                  <div className="p-3.5 bg-white rounded-lg border border-cohere-stone leading-relaxed text-[10px] text-[#4e4c45] italic font-sans pr-8">
                    "{activeReport.notes}"
                  </div>
                </div>
              )}

              {/* SIGNATURE SEALS FOOTER */}
              <div className="border-t border-[#1c1b18] pt-5 flex justify-between items-center flex-wrap gap-4 text-[10px] text-[#4e4c45] font-mono">
                <div>
                  <div className="font-bold text-[#1c1b18] flex items-center gap-1">
                    <Check size={11} className="text-cohere-green stroke-[2.5]" />
                    <span>Cryptographic Audit Seal Verified</span>
                  </div>
                  <span className="text-[#4e4c45] block mt-0.5 font-mono text-[8px] uppercase">Token ID: {activeReport.id}-{activeReport.shareToken}</span>
                </div>
                <div className="text-right flex items-center gap-2 font-mono">
                  <div className="border-r border-cohere-stone pr-3 py-1 text-right text-[9px] uppercase">
                    <span className="block font-bold text-[#1c1b18]">Auth Server: Connected</span>
                    <span className="text-[#4e4c45] block text-[8px] mt-0.5">SOC-3 Compliant Gateway</span>
                  </div>
                  <span className="text-base select-none">🔒</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white border border-cohere-clay rounded-xl p-12 text-center text-[#4e4c45] font-sans">
            No verification reports compiled yet. Select variables on the Left Panel and click generate to render.
          </div>
        )}
      </div>

    </div>
  );
}
