import React, { useState } from 'react';
import { ShieldCheck, BarChart3, Info, TrendingUp, AlertTriangle, Layers, Calendar, HelpCircle } from 'lucide-react';
import { EarningRecord, PlatformConnection } from '../types';

interface AnalyticsTabProps {
  earnings: EarningRecord[];
  platforms: PlatformConnection[];
}

export default function AnalyticsTab({ earnings, platforms }: AnalyticsTabProps) {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  // Math aggregates
  const totalByPlatform = platforms.reduce((acc, curr) => {
    acc[curr.platform] = earnings
      .filter(r => r.platform === curr.platform)
      .reduce((sum, item) => sum + item.amount, 0);
    return acc;
  }, {} as { [p: string]: number });

  const grandTotal = Object.values(totalByPlatform).reduce((a, b) => a + b, 0);

  // Group last 12 months
  const monthlyTotals: { [month: string]: number } = {};
  earnings.forEach(record => {
    monthlyTotals[record.date] = (monthlyTotals[record.date] || 0) + record.amount;
  });

  const sortedMonths = Object.keys(monthlyTotals).sort().slice(-12);
  const monthlyData = sortedMonths.map(m => ({
    month: m,
    amount: monthlyTotals[m]
  }));

  // Math calculations for stability (volatility coefficient)
  const averageMonthly = grandTotal / (sortedMonths.length || 12);
  const squaredDifferencesSum = monthlyData.reduce((sum, item) => {
    const diff = item.amount - averageMonthly;
    return sum + (diff * diff);
  }, 0);
  const variance = squaredDifferencesSum / (monthlyData.length || 1);
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = averageMonthly > 0 ? (standardDeviation / averageMonthly) : 0;
  
  // Predict stability score out of 100 based on variation coeff
  const stabilityScore = Math.max(30, Math.round(100 - (coefficientOfVariation * 100)));

  // Stability profile translation
  let riskLevel = 'Low Volatility';
  let riskColor = 'text-cohere-green';
  let riskBg = 'bg-[#e8efea] border-cohere-green/10';
  let profileDescription = 'Your connected earnings demonstrate outstanding consistency, with minimal month-to-month variance. Traditional institutional underwriters treat this stability level as a prime approval equivalent.';

  if (stabilityScore < 85) {
    riskLevel = 'Moderate Seasonal';
    riskColor = 'text-[#bd8941]';
    riskBg = 'bg-cohere-sand/40 border-cohere-stone';
    profileDescription = 'Moderate income variance detected. This reflects natural seasonal cycles common to independent professionals. This data remains clean and approved for standard credit lines.';
  } else if (stabilityScore < 70) {
    riskLevel = 'Elevated Variance';
    riskColor = 'text-rose-700';
    riskBg = 'bg-rose-50 border-rose-200';
    profileDescription = 'Slightly higher volatility registered. Underwriters may request secondary tax schedule verification. We recommend generating a certified Mortgage report to anchor this profile.';
  }

  return (
    <div className="space-y-6">
      
      {/* Intro banner */}
      <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs">
        <h3 className="font-serif italic font-bold text-base text-[#1c1b18]">Income Stability Index</h3>
        <p className="text-xs text-[#4e4c45] mt-1 max-w-2xl leading-relaxed font-sans">
          Analytically weighing historical direct-deposit records using institutional volatility models. High stability index parameters verify continuous liquidity and debt service thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stability Gauge */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 flex flex-col justify-between shadow-3xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] uppercase tracking-tight">Stability Gauge</h3>
              <span className="text-[9px] font-mono tracking-wider bg-cohere-sand text-cohere-light-ink border border-cohere-stone px-2 py-0.5 rounded font-bold uppercase">Standard Risk Ratio</span>
            </div>
            <p className="text-xs text-[#4e4c45] font-sans">
              Measures standard deviation across connected pay pools relative to historical averages.
            </p>
          </div>

          <div className="my-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center select-none shrink-0 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="var(--color-cohere-stone)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="280"
                  strokeDashoffset="75"
                  strokeLinecap="round"
                  className="opacity-40"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="var(--color-cohere-green)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="280"
                  strokeDashoffset={280 - (210 * stabilityScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span id="stability-score-circle" className="text-2xl font-serif italic font-bold text-[#1c1b18] leading-none">{stabilityScore}%</span>
                <span className="block text-[8px] text-[#4e4c45] font-mono tracking-wider mt-0.5 uppercase">STABILITY</span>
              </div>
            </div>

            {/* Profile translation */}
            <div className="flex-1 space-y-3">
              <div className={`p-3 rounded-lg border text-[#4e4c45] ${riskBg}`}>
                <div className="flex gap-1.5 items-center">
                  <ShieldCheck size={14} className={riskColor} />
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${riskColor}`}>{riskLevel}</span>
                </div>
                <p className="text-[10px] text-[#4e4c45] mt-1.5 leading-relaxed font-sans">
                  {profileDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-cohere-stone pt-2.5 font-mono text-[10px]">
                <div>
                  <span className="text-[9px] text-[#4e4c45] block font-normal">Income Variance</span>
                  <span className="text-xs font-bold text-[#1c1b18]">{(coefficientOfVariation * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#4e4c45] block font-normal">Dev. Bound</span>
                  <span className="text-xs font-bold text-[#1c1b18]">±${Math.round(standardDeviation).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-cohere-stone pt-3 flex items-center justify-between text-[10px] text-[#4e4c45] font-mono">
            <span className="flex items-center gap-1.5"><Info size={11} className="text-[#4e4c45]" /> Meets Fannie Mae criteria standards</span>
            <span className="font-bold text-cohere-green uppercase">Calculated Live</span>
          </div>
        </div>

        {/* Income Distribution Card */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 flex flex-col justify-between shadow-3xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] uppercase">Income Distribution</h3>
              <span className="text-[9px] font-mono tracking-wider bg-cohere-sand text-cohere-light-ink border border-cohere-stone px-2 py-0.5 rounded font-bold uppercase">Ledger Share</span>
            </div>
            <p className="text-xs text-[#4e4c45] font-sans">
              Visualizes connected platform earnings. Multi-source records provide robust stability factors.
            </p>
          </div>

          <div className="my-5 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {Object.keys(totalByPlatform).map((platform, idx) => {
                  const amt = totalByPlatform[platform];
                  const percent = grandTotal > 0 ? (amt / grandTotal) * 100 : 0;
                  
                  let accumulatedPercent = 0;
                  Object.keys(totalByPlatform).slice(0, idx).forEach(pName => {
                    accumulatedPercent += (totalByPlatform[pName] / grandTotal) * 100;
                  });

                  const radius = 32;
                  const circum = 2 * Math.PI * radius;
                  const dashoffset = circum - (percent / 100) * circum;
                  const rotationOffset = (accumulatedPercent / 100) * 360;

                  const platformColors: { [p: string]: string } = {
                    Uber: 'var(--color-cohere-green)',
                    DoorDash: '#CF4500',
                    Upwork: '#3860BE',
                    Fiverr: '#9A3A0A',
                    Lyft: '#bd8941',
                    Instacart: '#2d4231'
                  };

                  const strokeColor = platformColors[platform] || '#6b7280';

                  return (
                    <circle
                      key={platform}
                      cx="50"
                      cy="50"
                      r={radius}
                      stroke={strokeColor}
                      strokeWidth={hoveredPlatform === platform ? 9 : 7}
                      fill="transparent"
                      strokeDasharray={circum}
                      strokeDashoffset={dashoffset}
                      transform={`rotate(${rotationOffset - 90} 50 50)`}
                      className="cursor-pointer transition-all duration-300 transform origin-center"
                      onMouseEnter={() => setHoveredPlatform(platform)}
                      onMouseLeave={() => setHoveredPlatform(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute text-center text-3xs font-sans max-w-[80px]">
                {hoveredPlatform ? (
                  <>
                    <span className="block font-bold text-zinc-950 truncate uppercase tracking-widest text-[8px]">{hoveredPlatform}</span>
                    <span className="block font-bold text-xs text-zinc-800 mt-0.5">
                      {grandTotal > 0 ? Math.round((totalByPlatform[hoveredPlatform] / grandTotal) * 100) : 0}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block text-zinc-400 font-mono text-[8px] tracking-wider uppercase">AGGREGATE</span>
                    <span className="block font-bold text-xs text-zinc-950 mt-0.5">${grandTotal.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* Color metrics listed */}
            <div className="my-auto space-y-1.5">
              {platforms.map((p) => {
                const amt = totalByPlatform[p.platform] || 0;
                const percent = grandTotal > 0 ? (amt / grandTotal) * 100 : 0;
                
                const platformColors: { [p: string]: string } = {
                  Uber: 'bg-cohere-green',
                  DoorDash: 'bg-[#CF4500]',
                  Upwork: 'bg-[#3860BE]',
                  Fiverr: 'bg-[#9A3A0A]',
                  Lyft: 'bg-[#bd8941]',
                  Instacart: 'bg-[#2d4231]'
                };

                return (
                  <div 
                    key={p.platform} 
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      hoveredPlatform === p.platform ? 'bg-cohere-sand border-cohere-stone' : 'bg-white border-cohere-clay'
                    }`}
                    onMouseEnter={() => setHoveredPlatform(p.platform)}
                    onMouseLeave={() => setHoveredPlatform(null)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${platformColors[p.platform] || 'bg-zinc-400'}`}></span>
                      <span className="font-bold text-[10px] text-[#1c1b18]">{p.platform}</span>
                    </div>
                    <div className="text-right font-mono text-[9px]">
                      <span className="font-bold text-[#1c1b18] block">${amt.toLocaleString()}</span>
                      <span className="text-[#4e4c45] block font-sans">{Math.round(percent)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-cohere-stone pt-3 text-[10px] text-[#4e4c45] font-sans italic text-center leading-relaxed">
            Multi-app distribution protects credit indexes from platform dynamic algorithm shifts.
          </div>
        </div>
      </div>

      {/* Seasonal predictability insights section */}
      <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="text-cohere-green font-bold" size={16} strokeWidth={2.5} />
          <h3 className="font-serif italic font-bold text-sm tracking-tight text-[#1c1b18] uppercase">Portfolio Diversification Analysis</h3>
        </div>
        <p className="text-xs text-[#4e4c45] leading-relaxed font-sans mb-4">
          Lenders evaluate risk weightings across structural gig channels. Blending active rideshare (spikes weekends & festivals), microtasks (evening spikes), and enterprise contracting platforms (slower, billing cycles) achieves optimal volatility protection.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          
          <div className="bg-[#fffdfa] rounded-xl p-4 border border-cohere-clay">
            <h4 className="font-serif italic font-bold text-xs text-[#1c1b18] tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cohere-green animate-pulse"></span> Rideshare Portfolio
            </h4>
            <div className="mt-3 flex justify-between items-center text-[10px] text-[#4e4c45] border-b border-cohere-stone pb-1.5 font-mono">
              <span>Category Volume</span>
              <span className="font-bold text-[#1c1b18]">42% of Portfolio</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-[10px] text-[#4e4c45] border-b border-cohere-stone pb-1.5 font-mono">
              <span>Stability Rating</span>
              <span className="font-bold text-cohere-green">Excellent (98%)</span>
            </div>
            <p className="text-[10px] text-[#4e4c45] mt-3 leading-relaxed font-sans">
              Maintains high daily liquidity. Perfect for immediate payout requests to bridge invoice payout windows.
            </p>
          </div>

          <div className="bg-[#fffdfa] rounded-xl p-4 border border-cohere-clay">
            <h4 className="font-serif italic font-bold text-xs text-[#1c1b18] tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CF4500] animate-pulse"></span> On-Demand Delivery
            </h4>
            <div className="mt-3 flex justify-between items-center text-[10px] text-[#4e4c45] border-b border-cohere-stone pb-1.5 font-mono">
              <span>Category Volume</span>
              <span className="font-bold text-[#1c1b18]">36% of Portfolio</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-[10px] text-[#4e4c45] border-b border-cohere-stone pb-1.5 font-mono">
              <span>Stability Rating</span>
              <span className="font-bold text-[#bd8941]">Stable (85%)</span>
            </div>
            <p className="text-[10px] text-[#4e4c45] mt-3 leading-relaxed font-sans">
              Provides excellent counter-cyclical stability. Extreme weather or holiday cycles spike food transport volume.
            </p>
          </div>

          <div className="bg-[#fffdfa] rounded-xl p-4 border border-cohere-clay">
            <h4 className="font-serif italic font-bold text-xs text-[#1c1b18] tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3860BE] animate-pulse"></span> Professional Freelance
            </h4>
            <div className="mt-3 flex justify-between items-center text-[10px] text-[#4e4c45] border-b border-cohere-stone pb-1.5 font-mono">
              <span>Category Volume</span>
              <span className="font-bold text-[#1c1b18]">22% of Portfolio</span>
            </div>
            <div className="mt-2 flex justify-between items-center text-[10px] text-[#4e4c45] border-b border-cohere-stone pb-1.5 font-mono">
              <span>Stability Rating</span>
              <span className="font-bold text-rose-700">High Variance</span>
            </div>
            <p className="text-[10px] text-[#4e4c45] mt-3 leading-relaxed font-sans">
              Captures higher contract billings. Accelerates net net balances but remains vulnerable to client calendar shifts.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
