import React, { useState } from 'react';
import { Shield, RefreshCw, Plus, TrendingUp, Sparkles, Activity, AlertCircle, PlayCircle, Layers, CheckCircle2, Link2, Info } from 'lucide-react';
import { PlatformConnection, SyncEvent, EarningRecord } from '../types';

interface DashboardTabProps {
  platforms: PlatformConnection[];
  syncLogs: SyncEvent[];
  earnings: EarningRecord[];
  onOpenArgyleModal: () => void;
  onRefreshPlatform: (platformName: string) => void;
  onTriggerRealtimeEvent: (platform: 'Uber' | 'DoorDash' | 'Upwork') => void;
  isBackendConnected: boolean;
  onDisconnectPlatform: (platformName: string) => void;
}

export default function DashboardTab({
  platforms,
  syncLogs,
  earnings,
  onOpenArgyleModal,
  onRefreshPlatform,
  onTriggerRealtimeEvent,
  isBackendConnected,
  onDisconnectPlatform
}: DashboardTabProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ month: string; amount: number; index: number } | null>(null);

  // Group last 12 months for chart representation
  const monthlyDataMap: { [month: string]: number } = {};
  earnings.forEach(record => {
    monthlyDataMap[record.date] = (monthlyDataMap[record.date] || 0) + record.amount;
  });

  const sortedMonths = Object.keys(monthlyDataMap).sort().slice(-12);
  const chartData = sortedMonths.map(month => ({
    month: month,
    amount: monthlyDataMap[month]
  }));

  const totalIncomeLast12Months = chartData.reduce((acc, curr) => acc + curr.amount, 0);
  const averageMonthlyIncome = chartData.length > 0 ? (totalIncomeLast12Months / chartData.length) : 0;

  // Render variables for custom SVG line chart
  const padding = 40;
  const width = 600;
  const height = 180;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.amount)) * 1.1 : 5000;
  const minVal = chartData.length > 0 ? Math.min(...chartData.map(d => d.amount)) * 0.9 : 1000;
  const valRange = maxVal - minVal;

  const getCoordinates = (index: number, val: number) => {
    if (chartData.length === 0) return { x: 0, y: 0 };
    const x = padding + (index / (chartData.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y };
  };

  const points = chartData.map((d, index) => getCoordinates(index, d.amount));
  const pathData = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    return `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Grid lines
  const gridLines = [];
  const gridLineCount = 4;
  for (let i = 0; i < gridLineCount; i++) {
    const val = minVal + (i / (gridLineCount - 1)) * valRange;
    const y = padding + chartHeight - (i / (gridLineCount - 1)) * chartHeight;
    gridLines.push({ value: Math.round(val), y });
  }

  return (
    <div className="space-y-6">
      
      {/* 🛠️ STEP-BY-STEP ARGYLE SANDBOX INSTRUCTIONS - Cohere style */}
      <div className="bg-[#fffdfa] rounded-xl border border-cohere-clay p-5 shadow-3xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#e8efea] rounded-md border border-cohere-green/10 flex items-center justify-center text-cohere-green mt-0.5 shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1 min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9px] text-[#4e4c45] bg-cohere-sand border border-cohere-stone px-2 py-0.5 rounded font-bold uppercase tracking-wider">Underwriter Sandbox Guide</span>
                <span className="text-[10px] text-cohere-green font-semibold flex items-center gap-1 font-mono">
                  <span className="w-1 h-1 rounded-full bg-cohere-green animate-ping"></span>
                  • Sandbox Live Sim active
                </span>
              </div>
              <h3 className="text-base font-serif italic font-bold text-[#1c1b18] mt-1.5">Argyle Direct Connection Handshake</h3>
              <p className="text-xs text-[#4e4c45] leading-relaxed mt-1 font-sans">
                Krostio is equipped with an interactive Argyle sandbox credentials simulation. Traditional paystubs are prone to tampering; underwriting reports verified directly from linked source databases establish 100% data integrity.
              </p>
            </div>

            {/* Quickstart steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="bg-cohere-cream p-3 rounded-lg border border-cohere-stone">
                <div className="flex items-center gap-1.5 font-bold text-[#1c1b18] text-[10px] tracking-wider uppercase font-mono">
                  <span className="min-w-4 h-4 rounded bg-cohere-green text-cohere-cream text-[9px] flex items-center justify-center font-mono font-bold">1</span>
                  <span>Direct DB Sync</span>
                </div>
                <p className="text-[10px] text-[#4e4c45] mt-1.5 leading-relaxed font-sans">
                  Click <strong className="text-cohere-green">"Connect Argyle Node"</strong>. Select Lyft, DoorDash or Upwork and type credentials to run the direct OAuth ingest.
                </p>
              </div>

              <div className="bg-cohere-cream p-3 rounded-lg border border-cohere-stone">
                <div className="flex items-center gap-1.5 font-bold text-[#1c1b18] text-[10px] tracking-wider uppercase font-mono">
                  <span className="min-w-4 h-4 rounded bg-cohere-green text-cohere-cream text-[9px] flex items-center justify-center font-mono font-bold">2</span>
                  <span>Webhook Event Stream</span>
                </div>
                <p className="text-[10px] text-[#4e4c45] mt-1.5 leading-relaxed font-sans">
                  Click the <strong className="text-cohere-green">Simulate Activity</strong> buttons to prompt immediate ledger events broadcasted over real-time pipelines.
                </p>
              </div>

              <div className="bg-cohere-cream p-3 rounded-lg border border-cohere-stone">
                <div className="flex items-center gap-1.5 font-bold text-[#1c1b18] text-[10px] tracking-wider uppercase font-mono">
                  <span className="min-w-4 h-4 rounded bg-cohere-green text-cohere-cream text-[9px] flex items-center justify-center font-mono font-bold">3</span>
                  <span>Issue Report</span>
                </div>
                <p className="text-[10px] text-[#4e4c45] mt-1.5 leading-relaxed font-sans">
                  Assemble encrypted underwriter summaries in <strong className="text-cohere-green">Verification Hub</strong>. Validate share URLs matching real estate lenders' parameters.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-cohere-stone">
              <span className="text-[10px] text-[#4e4c45] font-medium font-mono">Sync Channel status: <strong className="text-cohere-green font-bold">Connected</strong></span>
              <button
                onClick={onOpenArgyleModal}
                className="px-4 py-1.5 bg-[#2d4231] hover:bg-cohere-forest text-cohere-cream font-mono font-bold text-[10px] uppercase tracking-wider rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Link2 size={12} className="text-cohere-sage" /> CONNECT ARGYLE NODE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS GRID - Cohere Styled Minimalistic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-cohere-clay shadow-3xs">
          <span className="text-[9px] text-[#4e4c45] uppercase tracking-wider font-bold font-mono">Argyle Certified Income</span>
          <p id="total-income-display" className="text-2xl font-serif italic font-bold text-[#1c1b18] tracking-tight mt-1.5">${totalIncomeLast12Months.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-3 text-[9px] text-cohere-green font-bold bg-[#e8efea] w-fit px-2 py-0.5 rounded border border-cohere-green/10 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cohere-green animate-pulse"></span>
            <span>Handshake Verified</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-cohere-clay shadow-3xs">
          <span className="text-[9px] text-[#4e4c45] uppercase tracking-wider font-bold font-mono">12-Month Average</span>
          <p id="average-income-display" className="text-2xl font-serif italic font-bold text-[#1c1b18] tracking-tight mt-1.5">${Math.round(averageMonthlyIncome).toLocaleString()} <span className="text-xs font-sans not-italic text-[#4e4c45]">/mo</span></p>
          <span className="text-[10px] text-[#4e4c45] mt-3 block font-mono font-medium">Mean Monthly Inflow</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-cohere-clay shadow-3xs">
          <span className="text-[9px] text-[#4e4c45] uppercase tracking-wider font-bold font-mono">Income Stability Index</span>
          <p id="stability-score-display" className="text-2xl font-serif italic font-bold text-cohere-green tracking-tight mt-1.5">95%</p>
          <div className="flex items-center gap-1 mt-3 text-[9px] text-cohere-green font-bold font-mono">
            <CheckCircle2 size={12} className="text-cohere-green stroke-[2.5]" />
            <span>Optimal Risk Tier</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-cohere-clay shadow-3xs">
          <span className="text-[9px] text-[#4e4c45] uppercase tracking-wider font-bold font-mono">Trajectory Rate</span>
          <p id="growth-outlook-display" className="text-2xl font-serif italic font-bold text-[#1c1b18] tracking-tight mt-1.5">+15% <span className="text-xs font-sans not-italic text-[#4e4c45]">YoY</span></p>
          <span className="text-[10px] text-[#4e4c45] mt-3 block font-mono font-medium">CAGR Slope: Positive</span>
        </div>
      </div>

      {/* Main Grid COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Income Trend Chart Card */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-serif italic font-bold text-base text-[#1c1b18]">Income Ledger Trendlines</h3>
              <span className="text-[9px] font-mono tracking-wider uppercase bg-cohere-sand border border-cohere-stone text-[#4e4c45] px-2 py-0.5 rounded font-bold">12-Month Roll</span>
            </div>
            <p className="text-xs text-[#4e4c45]">
              Real-time payout intervals directly calculated from your linked platform logs. Hover over the nodes for interactive metadata.
            </p>
          </div>

          {/* Line Chart */}
          <div className="my-4 relative h-[180px] flex items-center justify-center bg-cohere-cream/30 rounded-lg border border-cohere-stone p-2 overflow-visible">
            {chartData.length === 0 ? (
              <p className="text-xs text-cohere-light-ink font-mono">Connect payroll sources via Argyle link model to draw trendlines.</p>
            ) : (
              <svg 
                className="w-full h-full overflow-visible" 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cohere-green)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--color-cohere-green)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {gridLines.map((line, idx) => (
                  <g key={idx} className="opacity-40">
                    <line 
                      x1={padding} 
                      y1={line.y} 
                      x2={width - padding} 
                      y2={line.y} 
                      stroke="var(--color-cohere-stone)" 
                      strokeWidth={1} 
                      strokeDasharray="2 3" 
                    />
                    <text 
                      x={padding - 8} 
                      y={line.y + 3} 
                      fill="#5e5d57" 
                      fontSize="9" 
                      fontFamily="monospace" 
                      textAnchor="end"
                      fontWeight="bold"
                    >
                      ${line.value}
                    </text>
                  </g>
                ))}

                {/* Filled path */}
                {chartData.length > 1 && (
                  <path 
                    d={`${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`}
                    fill="url(#chart-area-grad)"
                  />
                )}

                {/* Line path */}
                {chartData.length > 1 && (
                  <path 
                    d={pathData} 
                    fill="none" 
                    stroke="var(--color-cohere-green)" 
                    strokeWidth={2.5} 
                    strokeLinecap="round" 
                  />
                )}

                {/* Circle nodes */}
                {points.map((p, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredPoint && hoveredPoint.index === idx ? 5 : 3.5} 
                      fill={hoveredPoint && hoveredPoint.index === idx ? 'var(--color-cohere-green)' : 'var(--color-cohere-sage)'} 
                      stroke="#ffffff" 
                      strokeWidth={1.5} 
                      onMouseEnter={() => setHoveredPoint({ 
                        month: chartData[idx].month, 
                        amount: chartData[idx].amount, 
                        index: idx 
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                ))}

                {/* Axis months labels */}
                {chartData.map((d, index) => {
                  const p = getCoordinates(index, d.amount);
                  const showLabel = index % 2 === 0;
                  if (!showLabel) return null;
                  return (
                    <text 
                      key={index} 
                      x={p.x} 
                      y={height - padding + 15} 
                      fill="#5e5d57" 
                      fontSize="9" 
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {d.month.split('-')[1]}/{d.month.split('-')[0].slice(-2)}
                    </text>
                  );
                })}
              </svg>
            )}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-[#1c1b18] text-white rounded p-2 shadow-md border border-cohere-stone text-[10px] pointer-events-none z-10 font-sans"
                style={{
                  left: `${((hoveredPoint.index / (chartData.length - 1)) * 82) + 8}%`,
                  bottom: '72%'
                }}
              >
                <div className="font-mono text-zinc-400 font-semibold">{hoveredPoint.month}</div>
                <div className="font-bold text-emerald-400 mt-0.5">${hoveredPoint.amount.toLocaleString()}</div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#4e4c45] border-t border-cohere-stone pt-3 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-cohere-green"></span> Consolidated view</span>
              <span className="text-cohere-clay">|</span>
              <span>Updated live via Argyle database feeds</span>
            </div>
            <span className="font-mono text-[9px] font-bold bg-cohere-sand border border-cohere-stone px-2 py-0.5 rounded text-cohere-light-ink">Continuous Polling</span>
          </div>
        </div>

        {/* Real-time Webhook Event Loop Ledger */}
        <div className="bg-white border border-cohere-clay rounded-xl p-5 flex flex-col justify-between h-full min-h-[310px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-serif italic font-bold text-base text-[#1c1b18] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cohere-green animate-pulse"></span> Websocket Feeds
              </h3>
              <span className="text-[9px] font-mono text-cohere-green bg-[#e8efea] border border-cohere-green/10 px-2 py-0.5 rounded uppercase font-bold">Realtime</span>
            </div>
            <p className="text-xs text-[#4e4c45] leading-normal font-sans">
              Listening live to API webhooks. Transactions materialize on this terminal instantly as drivers or creators complete pay cycles.
            </p>
          </div>

          {/* Event Logs stream */}
          <div className="flex-1 my-3 overflow-y-auto bg-[#1c1b18] rounded-md p-3.5 border border-cohere-stone font-mono text-[10px] flex flex-col gap-2 max-h-[150px] min-h-[120px] shadow-inner">
            {syncLogs.length === 0 ? (
              <p className="text-[#8e8d87] text-center py-6 italic font-sans text-[10px]">Awaiting channel broadcast events...</p>
            ) : (
              syncLogs.map((log) => (
                <div key={log.id} className="border-b border-[#2e2d27] pb-2 last:border-0 rounded flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[#8e8d87] text-[8px] uppercase tracking-wider font-bold">
                    <span>[{log.timestamp}]</span>
                    <span className="text-cohere-sage font-bold">LIVE STREAM</span>
                  </div>
                  <div className="text-cohere-cream font-sans font-semibold mt-0.5 flex justify-between items-center text-[10px]">
                    <span className="font-mono text-cohere-sage">{log.platform} payout sync</span>
                    {log.amount > 0 && <span className="text-cohere-cream font-mono font-bold">+${log.amount.toFixed(2)}</span>}
                  </div>
                  <span className="text-[9px] text-[#aeada7] font-sans mt-0.5 leading-relaxed">{log.details}</span>
                </div>
              ))
            )}
          </div>

          {/* Interactive Trigger Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold font-mono">Simulate Handshake Activity</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button 
                onClick={() => onTriggerRealtimeEvent('Uber')}
                className="py-1 bg-cohere-sand hover:bg-cohere-clay border border-cohere-stone text-[10px] text-cohere-ink font-mono font-bold rounded-md text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <PlayCircle size={11} className="text-cohere-green" /> +$35.50
              </button>
              <button 
                onClick={() => onTriggerRealtimeEvent('DoorDash')}
                className="py-1 bg-cohere-sand hover:bg-cohere-clay border border-cohere-stone text-[10px] text-cohere-ink font-mono font-bold rounded-md text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <PlayCircle size={11} className="text-[#CF4500]" /> +$18.20
              </button>
              <button 
                onClick={() => onTriggerRealtimeEvent('Upwork')}
                className="py-1 bg-cohere-sand hover:bg-cohere-clay border border-cohere-stone text-[10px] text-cohere-ink font-mono font-bold rounded-md text-center flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <PlayCircle size={11} className="text-blue-700" /> +$450.00
              </button>
            </div>
            <p className="text-[9px] text-center text-[#5e5d57] italic">
              Click triggers real-time broadcast and updates both standard logs and analytics databases.
            </p>
          </div>
        </div>
      </div>

      {/* Argyle Connection Management */}
      <div className="bg-white border border-cohere-clay rounded-xl p-5">
        <h3 className="font-serif italic font-bold text-base text-[#1c1b18] mb-1.5">Source Authentication Gateway</h3>
        <p className="text-xs text-[#4e4c45] mb-4 h-auto leading-relaxed">
          The following connections represent authorized sync nodes retrieving records directly from respective organization profiles via read-only Argyle verification tokens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div key={platform.platform} className="p-4 rounded-xl border border-cohere-stone hover:border-cohere-clay transition-all bg-[#fffdfa] flex flex-col justify-between min-h-[165px] hover:shadow-2xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl bg-cohere-cream w-10 h-10 rounded-md flex items-center justify-center border border-cohere-stone shadow-3xs">{platform.icon}</span>
                  <div>
                    <h4 className="font-bold text-xs text-[#1c1b18]">{platform.platform} Channel</h4>
                    <span className="inline-flex items-center gap-1 text-[9px] text-cohere-green bg-[#e8efea] px-1.5 py-0.5 rounded mt-1 font-semibold font-mono uppercase tracking-wider">
                      Argyle Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats values */}
              <div className="my-2.5 space-y-1.5 border-t border-b border-cohere-stone py-2 text-[10px] font-mono">
                <div className="flex justify-between items-center text-[#5e5d57]">
                  <span>Aggregated Earnings</span>
                  <span className="font-bold text-[#1c1b18]">${platform.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[#5e5d57]">
                  <span>Tenure Records</span>
                  <span className="font-bold text-[#1c1b18]">{platform.tenureMonths} Months</span>
                </div>
                <div className="flex justify-between items-center text-[#5e5d57]">
                  <span>Last Sync</span>
                  <span className="font-bold text-[#1c1b18] text-right truncate max-w-[150px]">{platform.lastSynced}</span>
                </div>
                <div className="flex justify-between items-center text-[#5e5d57]">
                  <span>Sync Path</span>
                  {platform.status === 'syncing' ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200 uppercase tracking-wide animate-pulse">
                      <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                      Pending Webhook
                    </span>
                  ) : isBackendConnected ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-cohere-green bg-[#e8efea] px-1.5 py-0.5 rounded border border-cohere-green/10 uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-cohere-green"></span>
                      DB Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-cohere-light-ink bg-cohere-sand px-1.5 py-0.5 rounded border border-cohere-stone uppercase tracking-wide">
                      <span className="w-1 h-1 rounded-full bg-[#8da491]"></span>
                      Sandbox Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Action tools */}
              <div className="flex items-center justify-between text-[10px] text-[#5e5d57] font-mono">
                <span className="text-[9px]">Live Tunnel Status</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onRefreshPlatform(platform.platform)}
                    className="p-1 hover:text-cohere-green transition-colors cursor-pointer text-[#4e4c45]"
                    title="Force Synced Poll"
                  >
                    <RefreshCw size={11} className="hover:rotate-180 duration-500 transition-all" />
                  </button>
                  <button 
                    onClick={() => onDisconnectPlatform(platform.platform)}
                    className="text-[9px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-100 rounded px-1.5 py-0.5 transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Connect Another */}
          <button
            onClick={onOpenArgyleModal}
            className="p-4 rounded-xl border border-dashed border-cohere-clay hover:border-cohere-green hover:bg-[#fffdfa]/60 transition-all flex flex-col items-center justify-center text-center group min-h-[165px] cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full border border-cohere-stone bg-white flex items-center justify-center text-[#4e4c45] group-hover:text-cohere-green group-hover:border-cohere-green transition-all mb-2 shadow-3xs">
              <Plus size={16} className="stroke-[2.5]" />
            </div>
            <h4 className="font-bold text-xs text-cohere-ink group-hover:text-cohere-green font-mono">Connect Payroll Source</h4>
            <p className="text-[10px] text-[#5e5d57] mt-1 max-w-xs leading-relaxed font-sans px-2">
              Establish a secure credentials link to other ride-hailing, dynamic gig platforms, or custom invoicing structures.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
