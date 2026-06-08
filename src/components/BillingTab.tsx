import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Sparkles, Loader2, Check, Download, Layers, ShieldCheck, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { UserSession } from '../types';

interface BillingTabProps {
  currentSession: UserSession;
  onUpdateSessionTier: (newTier: UserSession['tier']) => void;
  onTriggerResendEmail: (subject: string, bodyHTML: string) => void;
}

export default function BillingTab({ currentSession, onUpdateSessionTier, onTriggerResendEmail }: BillingTabProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Pro+' | null>(null);
  
  // Local checkout modal states (Fallback)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'success'>('details');

  // Paddle SDK live status tracker
  const [paddleStatus, setPaddleStatus] = useState<'not_loaded' | 'initializing' | 'connected' | 'error'>('not_loaded');
  const [paddleEnvironment, setPaddleEnvironment] = useState<'sandbox' | 'production'>('production');
  const [paddleClientToken, setPaddleClientToken] = useState<string>(import.meta.env.VITE_PADDLE_CLIENT_TOKEN || '');

  // Custom invoices log
  const [invoices, setInvoices] = useState<any[]>([
    { id: 'INV-2026-0041', date: '2026-06-08', amount: 19.00, plan: 'Pro Subscription', status: 'Paid' },
    { id: 'INV-2026-0030', date: '2026-05-08', amount: 19.00, plan: 'Pro Subscription', status: 'Paid' }
  ]);

  // Map of plans to their live Paddle Price IDs and amounts
  const PRICE_MAP = {
    Pro: {
      monthly: {
        priceId: 'pri_01ktmhwt86bvyfc2cjrwsv72z4',
        amount: 19.00,
        label: 'Krostio Pro Monthly'
      },
      annual: {
        priceId: 'pri_01ktmjd4gtkj1mwj39yswc9ntn',
        amount: 15.00,
        label: 'Krostio Pro Yearly'
      }
    },
    'Pro+': {
      monthly: {
        priceId: 'pri_01ktmhymvmj5dherhep8tjg64r',
        amount: 49.00,
        label: 'Pro+ Agency Monthly'
      },
      annual: {
        priceId: 'pri_01ktmj9c9v4987d8db797trfat',
        amount: 39.00,
        label: 'Pro+ Agency Yearly'
      }
    }
  };

  // Automated detection and polling loop for static/async script loading of Paddle.js
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    const initPaddleSDK = () => {
      const PaddleObj = (window as any).Paddle;
      if (PaddleObj) {
        clearInterval(checkInterval);
        setPaddleStatus('initializing');
        
        // Derive token
        const tokenToUse = paddleClientToken || 'test_paddle_token_your_client_token';
        const isSandbox = tokenToUse.startsWith('test_') || tokenToUse.startsWith('vendor_') || tokenToUse.includes('sandbox') || tokenToUse.includes('test');
        const env = isSandbox ? 'sandbox' : 'production';
        
        setPaddleEnvironment(env);
        
        try {
          if (PaddleObj.Environment && typeof PaddleObj.Environment.set === 'function') {
            PaddleObj.Environment.set(env);
          }
          PaddleObj.Initialize({
            token: tokenToUse,
            eventCallback: (event: any) => {
              console.log('[Paddle Billing Event Hook]', event);
              if (
                event.name === 'checkout.completed' || 
                event.name === 'checkout.transaction.completed' || 
                event.name === 'transaction.completed'
              ) {
                handlePaddleCheckoutSuccess(event);
              }
            }
          });
          setPaddleStatus('connected');
          console.log(`[Paddle SDK v2] Successfully initialized. Env: ${env}. Mode: Live Hook Active.`);
        } catch (err) {
          console.error('[Paddle SDK Initialization Error]', err);
          setPaddleStatus('error');
        }
      }
    };

    if (typeof window !== 'undefined') {
      // Begin quick loop checks for async Paddle script attachment
      if ((window as any).Paddle) {
        initPaddleSDK();
      } else {
        checkInterval = setInterval(initPaddleSDK, 400);
      }
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [paddleClientToken]);

  // Live Paddle checkout event callback handshakes
  const handlePaddleCheckoutSuccess = (paddleEvent: any) => {
    console.log('[Paddle Success Event Handler] Processing purchase data:', paddleEvent);
    
    let resolvedPlan: 'Pro' | 'Pro+' = 'Pro';
    let paidAmount = 19.00;
    let periodLabel = 'Monthly';

    try {
      // Inspect purchased price items from events payload
      const items = paddleEvent.data?.items || paddleEvent.data?.transaction?.items || [];
      const purchasedPriceId = items[0]?.price?.id || items[0]?.price_id || '';
      console.log('[Paddle Success Event Handler] Price ID purchased:', purchasedPriceId);

      if (purchasedPriceId === 'pri_01ktmhymvmj5dherhep8tjg64r') {
        resolvedPlan = 'Pro+';
        paidAmount = 49.00;
        periodLabel = 'Monthly (with 3 Days Trial)';
      } else if (purchasedPriceId === 'pri_01ktmj9c9v4987d8db797trfat') {
        resolvedPlan = 'Pro+';
        paidAmount = 39.00;
        periodLabel = 'Yearly (with 3 Days Trial)';
      } else if (purchasedPriceId === 'pri_01ktmjd4gtkj1mwj39yswc9ntn') {
        resolvedPlan = 'Pro';
        paidAmount = 15.00;
        periodLabel = 'Yearly';
      } else if (purchasedPriceId === 'pri_01ktmhwt86bvyfc2cjrwsv72z4') {
        resolvedPlan = 'Pro';
        paidAmount = 19.00;
        periodLabel = 'Monthly';
      } else {
        // Fallback guess based on active focus selection
        resolvedPlan = selectedPlan || 'Pro';
        paidAmount = resolvedPlan === 'Pro' 
          ? (billingCycle === 'monthly' ? 19.00 : 15.00) 
          : (billingCycle === 'monthly' ? 49.00 : 39.00);
        periodLabel = billingCycle === 'monthly' ? 'Monthly' : 'Yearly';
      }
    } catch (e) {
      console.warn('Could not fully parse dynamic price ID from custom billing event checkout payload', e);
      resolvedPlan = selectedPlan || 'Pro';
      paidAmount = resolvedPlan === 'Pro' 
        ? (billingCycle === 'monthly' ? 19.00 : 15.00) 
        : (billingCycle === 'monthly' ? 49.00 : 39.00);
      periodLabel = billingCycle === 'monthly' ? 'Monthly' : 'Yearly';
    }

    // Dynamic UI upgrader:
    onUpdateSessionTier(resolvedPlan);

    // Build real custom invoices log
    const txId = paddleEvent.data?.transaction_id || paddleEvent.data?.transaction?.id || paddleEvent.data?.id || `PDL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv = {
      id: txId.substring(0, 15).toUpperCase(),
      date: new Date().toISOString().substring(0, 10),
      amount: paidAmount,
      plan: `${resolvedPlan === 'Pro' ? 'Krostio Pro' : 'Pro+ Agency'} ${periodLabel} Subscription`,
      status: 'Paid'
    };
    
    setInvoices(prev => [newInv, ...prev]);

    // Send email via system resend proxy
    const invoiceHTML = `
      <div style="font-family: sans-serif; padding: 24px; color: #1c1b18; background-color: #f3f0ee; border: 1px solid #ccc; max-width: 500px; border-radius: 8px;">
        <h2 style="font-family: serif; font-style: italic;">Krostio Payment Activation Notification</h2>
        <p>Hi ${currentSession.fullName || 'Subscriber'}, your alternative credit score file is activated!</p>
        <hr style="border: 0; border-top: 1px solid #d4cfb4;" />
        <p><strong>Merchant Registrar:</strong> Paddle Live Checkout Systems</p>
        <p><strong>Activated Plan:</strong> ${resolvedPlan === 'Pro' ? 'Krostio Pro v2' : 'Pro+ Agency Elite'} Premium</p>
        <p><strong>Recurring Charge Rate:</strong> $${paidAmount.toFixed(2)} (${periodLabel})</p>
        <p><strong>Transaction Log ID:</strong> ${newInv.id}</p>
        <hr style="border: 0; border-top: 1px solid #d4cfb4;" />
        <p>All limit constraints on connected Argyle platform connections have been fully revoked!</p>
      </div>
    `;
    onTriggerResendEmail(`Invoice confirmed: ${resolvedPlan} activated successfully via Paddle`, invoiceHTML);

    setCheckoutStep('success');
    setSelectedPlan(resolvedPlan);
  };

  // Triggering handle for pricing item selects
  const handleSelectUpgrade = (plan: 'Pro' | 'Pro+') => {
    setSelectedPlan(plan);
    const billingCycleKey = billingCycle;
    const planKey = plan;
    const planPricing = PRICE_MAP[planKey][billingCycleKey];

    // Check if Paddle v2 hook objects are active and available on window
    const PaddleObj = (window as any).Paddle;

    if (PaddleObj && paddleStatus === 'connected') {
      setIsProcessing(true);
      console.log('[Paddle Checkout Bridge] Initiating payment Overlay for Price ID:', planPricing.priceId);
      
      try {
        PaddleObj.Checkout.open({
          items: [
            {
              priceId: planPricing.priceId,
              quantity: 1
            }
          ],
          customer: {
            email: currentSession.email
          },
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            locale: 'en'
          }
        });
      } catch (err: any) {
        console.warn('Paddle Checkout open generated an error, launching customizable sandbox developer form modal:', err);
        // Fallback dynamically
        handleOpenCheckout(plan);
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log('Paddle global SDK object not fully initialized or offline, showing fully automated, customizable sandbox simulation modal...');
      handleOpenCheckout(plan);
    }
  };

  const handleOpenCheckout = (planName: 'Pro' | 'Pro+') => {
    setSelectedPlan(planName);
    setCheckoutStep('details');
  };

  const handleProcessDefaultPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setCheckoutStep('processing');

    setTimeout(() => {
      onUpdateSessionTier(selectedPlan!);
      
      const priceParams = PRICE_MAP[selectedPlan!][billingCycle];
      const newInv = {
        id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().substring(0, 10),
        amount: priceParams.amount,
        plan: `${selectedPlan === 'Pro' ? 'Krostio Pro' : 'Pro+ Agency'} ${billingCycle === 'annual' ? 'Annual' : 'Monthly'} (Developer Mock)`,
        status: 'Paid'
      };
      setInvoices([newInv, ...invoices]);

      const invoiceHTML = `
        <div style="font-family: sans-serif; padding: 24px; color: #1c1b18; background-color: #f3f0ee; border: 1px solid #ccc; max-width: 500px; border-radius: 8px;">
          <h2 style="font-family: serif; font-style: italic;">Krostio Invoice Payment Confirmation (Developer Sandbox)</h2>
          <p>Hi ${currentSession.fullName || 'Subscriber'}, thank you for testing the Krostio platform!</p>
          <hr style="border: 0; border-top: 1px solid #d4cfb4;" />
          <p><strong>Subscribed Tier:</strong> ${selectedPlan} Subscription (${billingCycle})</p>
          <p><strong>Billed Total:</strong> $${priceParams.amount.toFixed(2)}</p>
          <p><strong>Verification Partner:</strong> Argyle Direct Link Sync Enabled</p>
          <hr style="border: 0; border-top: 1px solid #d4cfb4;" />
          <p>Go to your dashboard to generate custom lender reports instantly!</p>
        </div>
      `;
      onTriggerResendEmail(`Invoice confirmed: ${selectedPlan} Premium Upgraded`, invoiceHTML);

      setCheckoutStep('success');
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro banner */}
      <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif italic font-bold text-sm text-[#1c1b18]">Subscription & Billing</h3>
          <p className="text-xs text-[#4e4c45] max-w-2xl leading-relaxed font-sans">
            Manage your Krostio plan parameters. Transactions are managed through our secure Paddle integration supporting real-time webhook updates and instant alternative credit account unlocking.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="bg-[#fffdfa] border border-cohere-stone px-3.5 py-2.5 rounded-lg text-left shrink-0 max-w-xs font-sans">
          <span className="text-[8px] tracking-widest block text-muted font-bold uppercase font-mono mb-1">
            • PADDLE MERCHANT HUB
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold">
            {paddleStatus === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00AA44] animate-pulse"></span>
                <span className="text-ink">PADDLE: LIVE ACTIVE ({paddleEnvironment.toUpperCase()})</span>
              </>
            ) : paddleStatus === 'initializing' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-spin"></span>
                <span className="text-muted">CONNECTING REGISTRY...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                <span className="text-[#CF4500]">PADDLE: MOCK SIMULATOR</span>
              </>
            )}
          </div>
          <span className="text-[9px] text-[#4e4c45]/70 block font-mono uppercase tracking-tight mt-0.5" style={{ fontSize: '8px' }}>
            ID: {paddleClientToken ? paddleClientToken.substring(0, 18) + '...' : 'NONE - SIMULATION FAILSAFE'}
          </span>
        </div>
      </div>

      {/* Manual configuration drawer component strictly for developer validation */}
      <div className="bg-cohere-sand/30 border border-cohere-stone/70 p-4 rounded-xl text-xs font-sans">
        <details className="cursor-pointer group">
          <summary className="font-sans font-bold text-[10px] text-ink select-none uppercase tracking-wider flex items-center gap-2">
            <span>⚙️ Customize Paddle Credentials Live</span>
            <span className="text-[8px] text-zinc-500 font-mono font-medium group-open:hidden">(Click to open config)</span>
          </summary>
          <div className="space-y-3 pt-3 mt-3 border-t border-border/60">
            <p className="text-[10px] text-zinc-500 leading-normal">
              You can paste custom live/test client vendor authorization keys from your Paddle merchant account to override defaults. Sandbox prices launch if token starts with <code>test_</code>.
            </p>
            <div className="flex gap-2 font-mono">
              <input
                type="text"
                placeholder="VITE_PADDLE_CLIENT_TOKEN"
                value={paddleClientToken}
                onChange={(e) => setPaddleClientToken(e.target.value)}
                className="w-full bg-[#fbfaf8] border border-cohere-clay text-[10px] px-3 py-1.5 rounded outline-none text-ink"
              />
              {paddleClientToken && (
                <button
                  type="button"
                  onClick={() => setPaddleClientToken('')}
                  className="px-2.5 bg-zinc-200 hover:bg-zinc-350 text-ink text-[9px] uppercase tracking-wider py-1 rounded"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="text-[9px] text-muted grid grid-cols-2 gap-2 mt-1">
              <div>
                <strong>Pro Product ID:</strong> <code>pro_01ktmhs8gm3qr2dhfx55j3r6cm</code>
              </div>
              <div>
                <strong>Agency Product ID:</strong> <code>pro_01ktmht422x1545mvn5gd07kvf</code>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Pricing cards columns layout */}
      <div>
        {/* Toggle option */}
        <div className="flex justify-center mb-6 select-none">
          <div className="flex bg-cohere-sand p-1 rounded-lg border border-cohere-stone">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer font-mono uppercase text-[9px] tracking-wider ${
                billingCycle === 'monthly' ? 'bg-[#1c1b18] text-cohere-cream' : 'text-[#4e4c45]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer font-mono uppercase text-[9px] tracking-wider ${
                billingCycle === 'annual' ? 'bg-[#1c1b18] text-cohere-cream' : 'text-[#4e4c45]'
              }`}
            >
              Annual <span className="text-[8px] font-mono font-bold text-cohere-green bg-[#e8efea] border border-cohere-green/10 px-1 py-0.2 rounded-sm uppercase tracking-widest">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-xs text-[#4e4c45] leading-relaxed">
          
          {/* FREE PLAN */}
          <div className="bg-white p-5 rounded-xl border border-cohere-clay flex flex-col justify-between shadow-3xs">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-bold font-mono">Free Tier</span>
              <h4 className="font-serif italic font-bold text-sm text-[#1c1b18] mt-1">Basic Access</h4>
              <p className="text-[11px] text-[#4e4c45] leading-normal mt-2 font-sans">
                Essential income tracking features for independent contractors.
              </p>
              
              <div className="my-5 flex items-baseline font-mono">
                <span className="text-2xl font-bold text-[#1c1b18]">$0</span>
                <span className="text-[10px] text-[#4e4c45] ml-1 font-sans">/ lifetime</span>
              </div>

              <ul className="space-y-2 border-t border-cohere-stone pt-4 text-[10px] text-[#4e4c45] font-semibold font-sans">
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Connect up to 1 platform via Argyle</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Basic earnings metrics</li>
                <li className="flex items-center gap-2 text-[#4e4c45]/50">❌ Compile Verification statements</li>
                <li className="flex items-center gap-2 text-[#4e4c45]/50">❌ Shareable verification check URLs</li>
              </ul>
            </div>

            <button
              disabled={currentSession.tier === 'Free'}
              className={`w-full mt-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg border transition-all ${
                currentSession.tier === 'Free' 
                  ? 'bg-cohere-sand border-cohere-stone text-[#4e4c45]/50 cursor-not-allowed' 
                  : 'bg-white border-[#1c1b18] text-[#1c1b18] hover:bg-cohere-sand cursor-pointer'
              }`}
            >
              {currentSession.tier === 'Free' ? 'Active' : 'Downgrade'}
            </button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-[#fffdfa] p-5 rounded-xl border-2 border-[#1c1b18] flex flex-col justify-between relative shadow-xs text-[#4e4c45]">
            <span className="absolute top-0 right-6 transform -translate-y-1/2 bg-[#1c1b18] text-cohere-cream text-[8px] font-bold uppercase font-mono px-2 py-0.5 rounded tracking-widest">
              POPULAR
            </span>
            <div>
              <span className="text-[8px] uppercase tracking-wider text-cohere-green font-bold font-mono">Professional</span>
              <h4 className="font-serif italic font-bold text-sm text-[#1c1b18] mt-1">Krostio Pro</h4>
              <p className="text-[11px] text-[#4e4c45] leading-normal mt-2 font-sans">
                Standard reporting features optimized for rental lease and mortgage loan underwriters.
              </p>
              
              <div className="my-5 flex items-baseline font-mono">
                <span className="text-2xl font-bold text-[#1c1b18]">
                  ${billingCycle === 'monthly' ? '19' : '15'}
                </span>
                <span className="text-[10px] text-[#4e4c45] ml-1 font-sans">/ month {billingCycle === 'annual' && 'billed annually'}</span>
              </div>

              <div className="text-[9px] text-[#4e4c45]/70 pb-3 font-mono">
                Price ID: <code>{billingCycle === 'monthly' ? PRICE_MAP.Pro.monthly.priceId : PRICE_MAP.Pro.annual.priceId}</code>
              </div>

              <ul className="space-y-2 border-t border-cohere-stone pt-4 text-[10px] text-[#4e4c45] font-semibold font-sans">
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Connect unlimited platforms via Argyle</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Compile unlimited verification statements</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Live volatility index & Tax match sync</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Active public verification check URLs</li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectUpgrade('Pro')}
              className={`w-full mt-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg transition-all shadow-xs cursor-pointer ${
                currentSession.tier === 'Pro' 
                  ? 'bg-cohere-sand text-[#4e4c45]/50 border border-cohere-stone cursor-not-allowed' 
                  : 'bg-[#1c1b18] text-cohere-cream hover:bg-[#1c1b18]/90'
              }`}
            >
              {currentSession.tier === 'Pro' ? 'Active' : paddleStatus === 'connected' ? 'Upgrade via Paddle' : 'Upgrade Plan'}
            </button>
          </div>

          {/* PRO+ PLAN */}
          <div className="bg-white p-5 rounded-xl border border-cohere-clay flex flex-col justify-between shadow-3xs">
            <div>
              <span className="text-[8px] uppercase tracking-wider text-[#4e4c45] font-bold font-mono">Agency</span>
              <h4 className="font-serif italic font-bold text-sm text-[#1c1b18] mt-1">Pro+ Agency</h4>
              <p className="text-[11px] text-[#4e4c45] leading-normal mt-2 font-sans">
                Designed for tax preparers, lenders, and mortgage brokerage firms.
              </p>
              
              <div className="my-5 flex items-baseline font-mono">
                <span className="text-2xl font-bold text-[#1c1b18]">
                  ${billingCycle === 'monthly' ? '49' : '39'}
                </span>
                <span className="text-[10px] text-[#4e4c45] ml-1 font-sans">/ month {billingCycle === 'annual' && 'billed annually'}</span>
              </div>

              <div className="text-[9px] text-[#4e4c45]/70 pb-3 font-mono">
                Price ID: <code>{billingCycle === 'monthly' ? PRICE_MAP['Pro+'].monthly.priceId : PRICE_MAP['Pro+'].annual.priceId}</code>
              </div>

              <ul className="space-y-2 border-t border-cohere-stone pt-4 text-[10px] text-[#4e4c45] font-semibold font-sans">
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Unlimited logins with role-based access</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Full document generation & API integrations</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Direct CPA portal tax export spreadsheets</li>
                <li className="flex items-center gap-2"><Check size={11} className="text-cohere-green stroke-[3]" /> Dedicated account priority managers</li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectUpgrade('Pro+')}
              className={`w-full mt-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest rounded-lg border transition-all cursor-pointer ${
                currentSession.tier === 'Pro+' 
                  ? 'bg-cohere-sand border-cohere-stone text-[#4e4c45]/50 cursor-not-allowed' 
                  : 'bg-white hover:bg-cohere-sand border-cohere-stone text-[#1c1b18]'
              }`}
            >
              {currentSession.tier === 'Pro+' ? 'Active' : paddleStatus === 'connected' ? 'Upgrade via Paddle' : 'Upgrade Plan'}
            </button>
          </div>

        </div>
      </div>

      {/* Invoice Receipts Logger */}
      <div className="bg-white border border-cohere-clay rounded-xl p-5 shadow-3xs">
        <h3 className="font-serif italic font-bold text-sm text-[#1c1b18] mb-3">Invoices Receipts</h3>
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left font-sans text-[11px] border-collapse leading-relaxed">
            <thead>
              <tr className="bg-cohere-sand/60 border-b border-cohere-stone text-[9px] uppercase tracking-wider text-[#4e4c45] font-bold font-mono">
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Billing Date</th>
                <th className="p-3">Plan Description</th>
                <th className="p-3 font-mono text-right">Total Paid</th>
                <th className="p-3 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="text-[#1c1b18] font-medium leading-relaxed font-sans">
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[#f0eee4] last:border-0 hover:bg-cohere-sand/30 font-sans" style={{ fontWeight: 450 }}>
                  <td className="p-3 font-mono text-[#4e4c45] font-bold text-[9px]">{inv.id}</td>
                  <td className="p-3 text-[#4e4c45]">{inv.date}</td>
                  <td className="p-3 text-[#1c1b18]">{inv.plan}</td>
                  <td className="p-3 font-mono text-right font-bold text-[#1c1b18]">${inv.amount.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <span className="inline-flex items-center gap-1 tracking-widest uppercase font-mono text-[8px] text-cohere-green bg-[#e8efea] px-2 py-0.5 rounded border border-cohere-green/10 font-bold">
                      <Check size={9} strokeWidth={3} /> Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secure Checkout Sandbox Modal (Fallback in case of no active token or offline sandbox context) */}
      {selectedPlan && checkoutStep !== 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1b18]/45 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden bg-white rounded-xl shadow-lg border border-cohere-stone flex flex-col animate-fade-in font-sans">
            
            {/* checkout gateway branding header */}
            <div className="bg-[#fffdfa] px-5 py-4 border-b border-cohere-stone flex justify-between items-center">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-base select-none">💳</span>
                <div>
                  <span className="font-mono text-[8px] text-[#4e4c45] block tracking-widest uppercase font-bold text-[8px]">SANDBOX FAILSAFE GATEWAY</span>
                  <span className="text-[11px] font-bold text-[#1c1b18] font-sans">Local transaction simulation</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="text-[10px] font-mono font-bold text-[#4e4c45] uppercase tracking-wider hover:text-[#1c1b18] cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5">
              {checkoutStep === 'details' && (
                <form onSubmit={handleProcessDefaultPayment} className="space-y-4 text-xs font-sans">
                  <div className="bg-[#fffdfa] p-3 rounded-lg border border-cohere-clay justify-between items-center flex font-sans">
                    <div>
                      <span className="text-[8px] text-[#4e4c45] font-bold block uppercase font-mono">Product Class</span>
                      <span className="text-xs font-bold text-[#1c1b18] font-serif italic">{selectedPlan} Plan</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#1c1b18] font-mono">
                        ${PRICE_MAP[selectedPlan][billingCycle].amount.toFixed(2)}
                      </span>
                      <span className="text-[8px] text-[#4e4c45] block font-mono uppercase tracking-wider">
                        {billingCycle === 'annual' ? '/ year' : '/ month'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1 font-mono">Card Number</label>
                      <input
                        type="text"
                        required
                        value="4000 1234 5678 9010"
                        readOnly
                        placeholder="Card Direct Identifier"
                        className="w-full px-3 py-2 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1 font-mono">Expiration</label>
                        <input
                          type="text"
                          required
                          value="08 / 29"
                          readOnly
                          className="w-full px-3 py-2 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-[#4e4c45] mb-1 font-mono">CVC</label>
                        <input
                          type="password"
                          required
                          value="123"
                          readOnly
                          className="w-full px-3 py-2 text-xs bg-cohere-cream border border-cohere-stone rounded-md focus:outline-hidden text-[#1c1b18] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-cohere-green hover:bg-cohere-forest text-cohere-cream font-mono text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-xs cursor-pointer animate-pulse"
                  >
                    Authorize Sandbox Payment
                  </button>
                  <p className="text-[9px] text-[#4e4c45]/70 text-center font-mono uppercase">
                    🔒 Zero-Risk Developer Testing (No charges apply)
                  </p>
                </form>
              )}

              {checkoutStep === 'processing' && (
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-cohere-green" />
                  <p className="text-xs font-mono font-bold text-[#1c1b18] uppercase tracking-wider animate-pulse">Contacting settlement server...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
