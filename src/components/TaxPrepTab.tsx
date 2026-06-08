import React, { useState } from 'react';
import { DollarSign, Percent, Scale, Calculator, Plus, Trash2, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { TaxWriteOff, PlatformConnection } from '../types';

interface TaxPrepTabProps {
  writeOffs: TaxWriteOff[];
  platforms: PlatformConnection[];
  onAddWriteOff: (item: Omit<TaxWriteOff, 'id' | 'date'>) => void;
  onDeleteWriteOff: (id: string) => void;
}

export default function TaxPrepTab({ writeOffs, platforms, onAddWriteOff, onDeleteWriteOff }: TaxPrepTabProps) {
  // Input form state
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TaxWriteOff['category']>('Mileage');

  const grossEarnings = platforms.reduce((acc, curr) => acc + curr.totalEarnings, 0);
  const totalDeductions = writeOffs.reduce((acc, curr) => acc + curr.amount, 0);
  const netEarnings = Math.max(0, grossEarnings - totalDeductions);

  // Estimations standard ratios
  const taxRateSE = 0.153; // US Self Employment tax (FICA) - 15.3%
  const estimatedSETax = netEarnings * taxRateSE;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amount) return;

    onAddWriteOff({
      label,
      amount: parseFloat(amount),
      category
    });

    setLabel('');
    setAmount('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Write-offs ledger and Calculator form */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Tax aggregations header metrics */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs">
          <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] mb-3">Schedule C Parameter Tool</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-3.5 bg-[#fffdfa] border border-cohere-stone rounded-lg font-mono">
              <span className="text-[8px] uppercase tracking-widest text-[#4e4c45] font-bold block">Gross Receipts</span>
              <span className="text-sm font-bold text-[#1c1b18] mt-1.5 block">${grossEarnings.toLocaleString()}</span>
              <span className="text-[9px] text-[#4e4c45] font-sans mt-1 block">Certified payroll feed</span>
            </div>

            <div className="p-3.5 bg-[#fffdfa] border border-cohere-stone rounded-lg font-mono">
              <span className="text-[8px] uppercase tracking-widest text-[#4e4c45] font-bold block">Total Deductions</span>
              <span className="text-sm font-bold text-rose-700 mt-1.5 block">-${totalDeductions.toLocaleString()}</span>
              <span className="text-[9px] text-[#4e4c45] font-sans mt-1 block">Part II write-offs</span>
            </div>

            <div className="p-3.5 bg-[#e8efea]/60 border border-cohere-green/10 rounded-lg font-mono">
              <span className="text-[8px] uppercase tracking-widest text-cohere-green font-bold block">Taxable Net Balance</span>
              <span className="text-sm font-bold text-cohere-green mt-1.5 block">${netEarnings.toLocaleString()}</span>
              <span className="text-[9px] text-cohere-green font-sans mt-1 block">Estimated taxable residue</span>
            </div>

          </div>
        </div>

        {/* Expense ledger listing */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs">
          <div className="flex justify-between items-center mb-4 select-none">
            <h3 className="font-serif italic font-bold text-sm text-[#1c1b18]">Deductions Registry</h3>
            <span className="text-[8px] font-mono uppercase tracking-widest text-cohere-green bg-[#e8efea] px-2 py-0.5 rounded border border-cohere-green/10 font-bold">Standard Formula</span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {writeOffs.length === 0 ? (
              <p className="text-xs text-[#4e4c45]/60 text-center py-6 font-sans">No tax deductibles logged yet.</p>
            ) : (
              writeOffs.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-3 rounded-lg border border-cohere-stone bg-white hover:border-cohere-clay transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-sm bg-[#fffdfa] w-8 h-8 rounded-md flex items-center justify-center border border-cohere-stone">
                      {w.category === 'Mileage' ? '🚗' : w.category === 'Platform Fees' ? '💳' : w.category === 'Internet & Phone' ? '📶' : w.category === 'Equipment' ? '⚙️' : '📝'}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#1c1b18] font-sans">{w.label}</h4>
                      <span className="text-[9px] text-[#4e4c45] font-mono tracking-wider uppercase font-bold">{w.category} • {w.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1c1b18] font-mono">-${w.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => onDeleteWriteOff(w.id)}
                      className="p-1 text-[#4e4c45] hover:text-rose-700 rounded transition cursor-pointer"
                      aria-label="Delete write-off"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right panel: Tax breakdown and writing Logger form */}
      <div className="space-y-6">

        {/* Input Dedutible form */}
        <div className="bg-[#fffdfa] border border-cohere-clay rounded-xl p-5 shadow-3xs">
          <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] mb-3">Log Deductible</h3>
          
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="block text-[8px] font-bold uppercase tracking-widest text-[#4e4c45] mb-1 font-mono">Expense Description</label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Mobile carrier invoice, mileage"
                className="w-full px-3 py-2 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden focus:border-cohere-green text-[#1c1b18] font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-[#4e4c45] mb-1 font-mono">category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2 py-2 text-[10px] bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-sans"
                >
                  <option value="Mileage">Vehicle Mileage</option>
                  <option value="Platform Fees">Platform Charges</option>
                  <option value="Internet & Phone">Phone & Web</option>
                  <option value="Equipment">Work Equipment</option>
                  <option value="Other">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-[#4e4c45] mb-1 font-mono">Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="34.50"
                  className="w-full px-2.5 py-1.8 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cohere-green hover:bg-cohere-forest text-cohere-cream font-mono text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={12} className="stroke-[3]" /> Add Deductible
            </button>
          </form>
        </div>

        {/* IRS compatibility segment */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 flex flex-col justify-between min-h-[200px] shadow-3xs">
          <div>
            <span className="block text-[8px] font-mono tracking-widest text-[#4e4c45] uppercase font-bold">Tax Reconciliation</span>
            <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] mt-1">Schedule C Alignment</h3>
            <p className="text-[10px] text-[#4e4c45] leading-relaxed mt-1.5 block font-sans">
              Krostio aligns verified payout pools directly with IRS Schedule C tax parameters. Credit underwriters utilize this transparent format to verify legitimate non-QM income approvals.
            </p>
          </div>

          <div className="bg-cohere-sand/40 p-3 rounded-lg border border-cohere-stone space-y-1 my-3 text-[10px] font-mono text-[#4e4c45]">
            <div className="flex justify-between items-center text-[#4e4c45]">
              <span className="font-sans">SE Tax Baseline FICA (15.3%)</span>
              <span className="font-bold text-[#1c1b18]">${Math.round(estimatedSETax).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] border-t border-cohere-stone pt-1.5 font-sans text-[#4e4c45]">
              <span>Write-off savings ratio</span>
              <span className="font-bold text-cohere-green">-${Math.round(totalDeductions * taxRateSE).toLocaleString()} Saved</span>
            </div>
          </div>

          <div className="text-[9px] text-[#4e4c45]/70 italic font-sans">
            Disclaimer: Projections are estimation guidelines. Always consult a certified CPA for official tax return registrations.
          </div>
        </div>

      </div>

    </div>
  );
}
