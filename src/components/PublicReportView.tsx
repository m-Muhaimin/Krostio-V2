import React from 'react';
import { ShieldCheck, Calendar, Printer, DollarSign, ArrowLeft, ArrowUpRight, Sparkles, Check } from 'lucide-react';
import { VerificationReport, PlatformConnection, EarningRecord } from '../types';

interface PublicReportViewProps {
  report: VerificationReport;
  platforms: PlatformConnection[];
  earnings: EarningRecord[];
  onBackToApp: () => void;
}

export default function PublicReportView({ report, platforms, earnings, onBackToApp }: PublicReportViewProps) {
  const totalEarningsAmt = earnings.reduce((sum, item) => sum + item.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-cohere-cream py-10 px-4 font-sans text-[#4e4c45]">
      
      {/* Top action header for demo controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center bg-white px-5 py-3.5 rounded-xl border border-cohere-clay select-none shadow-3xs">
        <button
          onClick={onBackToApp}
          className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#4e4c45] hover:text-[#1c1b18] transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={13} /> Console Home
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-cohere-light-ink bg-cohere-sand border border-cohere-stone px-2.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">Underwriter View Mode</span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-cohere-green text-cohere-cream rounded-lg px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-cohere-forest transition-all cursor-pointer shadow-xs"
          >
            <Printer size={11} /> Print Statement
          </button>
        </div>
      </div>

      {/* A4 Document sheet mockup */}
      <div className="bg-[#fffdfa] border border-cohere-clay shadow-xl rounded-xl overflow-hidden p-8 md:p-12 max-w-4xl mx-auto relative printable-pane select-text">
        
        {/* Verification banner stripe corner badge */}
        <div className="absolute right-0 top-0 w-24 h-24 overflow-hidden pointer-events-none">
          <div className="bg-[#e8efea] border-cohere-green/20 border text-cohere-green uppercase font-mono font-bold text-center py-1 text-[8px] tracking-widest rotate-45 transform translate-x-7 translate-y-4 w-32 border-b-2">
            SECURED
          </div>
        </div>

        {/* Brand stamp heading */}
        <div className="flex justify-between items-start border-b border-[#1c1b18] pb-5 mb-5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif italic font-bold tracking-tight text-lg text-[#1c1b18] leading-none">Krostio Portal</span>
              <span className="text-[#4e4c45] text-[9px] font-mono tracking-widest font-bold uppercase">// CERTIFIED DATA FILE</span>
            </div>
            <h1 className="text-xl font-serif italic font-medium text-[#1c1b18] tracking-tight mt-3">Verified Earnings Transcript</h1>
            <span className="inline-block text-[9px] uppercase tracking-wider text-cohere-light-ink bg-cohere-sand px-2 py-0.5 rounded border border-cohere-stone font-mono mt-1">DIRECT API INGEST • ENCRYPTED GATEWAY</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono font-bold bg-[#1c1b18] text-[#fffdfa] px-3 py-1 rounded uppercase tracking-wider">OFFICIAL RECONCILIATION</span>
            <div className="mt-4 text-[9px] font-mono text-[#4e4c45] flex flex-col gap-0.5 text-right font-bold uppercase">
              <span>Transcript Code: <strong className="text-[#1c1b18]">ARG-KRO-{report.argyleVerificationId}</strong></span>
              <span>Issued Block: <strong className="text-[#1c1b18]">{new Date(report.generatedAt).toLocaleDateString()}</strong></span>
              <span>Valid Date: <strong className="text-[#1c1b18]">{new Date(report.validThrough).toLocaleDateString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Credentials sections grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-[11px]">
          <div className="p-4 bg-white rounded-lg border border-cohere-stone">
            <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-mono font-bold block mb-1.5">Borrower Profile Credentials</span>
            <table className="w-full text-[#4e4c45] space-y-1 font-sans">
              <tbody>
                <tr className="border-b border-[#f0eee4] pb-1 flex justify-between">
                  <td className="text-[#4e4c45] font-normal pb-1">Primary Subject</td>
                  <td className="text-right text-[#1c1b18] pb-1 font-semibold">Marcus Johnson</td>
                </tr>
                <tr className="border-b border-[#f0eee4] py-1 flex justify-between">
                  <td className="text-[#4e4c45] font-normal py-1">Registered Address</td>
                  <td className="text-right text-[#1c1b18] py-1 font-mono">suprbuildllc@gmail.com</td>
                </tr>
                <tr className="pt-1 flex justify-between">
                  <td className="text-[#4e4c45] font-normal pt-1">Aggregated platform channels</td>
                  <td className="text-right text-[#1c1b18] pt-1 font-semibold">{platforms.length} Nodes connected</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-white rounded-lg border border-cohere-stone">
            <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-mono font-bold block mb-1.5">Verification Authenticator Details</span>
            <table className="w-full text-[#4e4c45] space-y-1 font-sans">
              <tbody>
                <tr className="border-b border-[#f0eee4] pb-1 flex justify-between">
                  <td className="text-[#4e4c45] font-normal pb-1">Direct Auth Match</td>
                  <td className="text-right text-cohere-green pb-1 font-mono font-bold flex items-center justify-end gap-1">
                    <Check size={11} className="text-cohere-green stroke-[2.5]" /> Argyle Protocol Link
                  </td>
                </tr>
                <tr className="border-b border-[#f0eee4] py-1 flex justify-between">
                  <td className="text-[#4e4c45] font-normal py-1">Underwriter Intent</td>
                  <td className="text-right text-[#1c1b18] py-1 font-semibold">{report.useCase}</td>
                </tr>
                <tr className="pt-1 flex justify-between font-mono">
                  <td className="text-[#4e4c45] font-normal pt-1 font-sans">Direct Auth Code</td>
                  <td className="text-right text-[#1c1b18] pt-1 font-bold">{report.argyleVerificationId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TRUST CERTIFICATE HIGHLIGHT */}
        <div className="border border-cohere-green/20 bg-[#e8efea]/30 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 font-mono">
          <div className="flex gap-2.5 items-start font-sans">
            <div className="w-7 h-7 bg-cohere-green text-cohere-cream rounded flex items-center justify-center font-bold text-xs font-mono select-none">OK</div>
            <div>
              <h4 className="font-bold text-xs text-[#1c1b18] tracking-wider uppercase font-mono">
                Argyle Institutional Ledger Authenticated
              </h4>
              <p className="text-[10px] text-[#4e4c45] mt-1 leading-relaxed">
                Structured payout data parsed from payroll authorities via end-to-end encrypted link tokens.
              </p>
            </div>
          </div>
          <div className="text-left md:text-right shrink-0 font-mono">
            <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-bold block">Verification Trust Rating</span>
            <span className="text-base font-bold text-cohere-green">99 / 100</span>
          </div>
        </div>

        {/* LEDGERS TABLE BREAKDOWN */}
        <div className="mb-5 font-sans">
          <h3 className="text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold mb-2 font-mono text-left">Pristine Source Breakdown</h3>
          <div className="border border-cohere-stone rounded-lg overflow-hidden bg-white mb-2">
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
            <span className="text-xs font-mono font-bold text-[#1c1b18]">${totalEarningsAmt.toLocaleString()}</span>
          </div>
        </div>

        {/* DTI STABILITY SECTION */}
        {report.includeStabilityScore && (
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
        {report.includeTaxMatch && (
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
        {report.notes && (
          <div className="mb-6">
            <h3 className="text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold mb-1 font-mono">Verification Comments</h3>
            <div className="p-3.5 bg-white rounded-lg border border-cohere-stone leading-relaxed text-[10px] text-[#4e4c45] italic font-sans pr-8">
              "{report.notes}"
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
            <span className="text-[#4e4c45] block mt-0.5 font-mono text-[8px] uppercase">Token ID: {report.id}-{report.shareToken}</span>
          </div>
          <div className="text-right flex items-center gap-2 font-mono p-1">
            <div className="border-r border-cohere-stone pr-3 py-1 text-right text-[9px] uppercase">
              <span className="block font-bold text-[#1c1b18]">Auth Server: Connected</span>
              <span className="text-[#4e4c45] block text-[8px] mt-0.5">SOC-3 Compliant Gateway</span>
            </div>
            <span className="text-base select-none">🔒</span>
          </div>
        </div>

      </div>

    </div>
  );
}
