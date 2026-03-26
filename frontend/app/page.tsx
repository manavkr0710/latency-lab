"use client";
import { useState, useEffect } from 'react';
import { Search, Zap, AlertTriangle, Globe, Activity, Info, BarChart3, TrendingDown, MousePointer2, Monitor, TabletSmartphone } from 'lucide-react';

// Advice database for recommendations
const ADVICE_DB: Record<string, { label: string; tip: string; color: string }> = {
  'connect.facebook.net': { label: 'Tracking Pixel', tip: 'Move to Server-Side GTM to save 200ms+ of browser load.', color: 'bg-blue-500' },
  'google-analytics.com': { label: 'Analytics', tip: 'Ensure you are using the latest gtag.js with the "defer" attribute.', color: 'bg-green-500' },
  'googletagmanager.com': { label: 'Tag Manager', tip: 'Audit your tags; every script inside GTM adds to this latency.', color: 'bg-emerald-500' },
  'static.hotjar.com': { label: 'Heatmap', tip: 'Set to trigger only after 5 seconds of user activity (Lazy Load).', color: 'bg-orange-500' },
  'tiktok.com': { label: 'Social Pixel', tip: 'Significant TTFB impact. Consider using a Shopify Pixel Sandbox.', color: 'bg-black' },
  'shopify.com': { label: 'Core Shopify', tip: 'Internal script. Usually optimized, but check for theme conflicts.', color: 'bg-purple-500' },
  'klaviyo.com': { label: 'Marketing', tip: 'Delay initialization until the first mouse movement.', color: 'bg-blue-400' },
};

//anything that is not in the above list is categorized as a "Third-Party Script" with general advice.
const getAdvice = (hostname: string) => {
  const match = Object.keys(ADVICE_DB).find(key => hostname.includes(key));
  return ADVICE_DB[match || ''] || { label: 'Third-Party', tip: 'General script: Consider deferring or using a Web Worker.', color: 'bg-slate-400' };
};

//Skeleton Components for loading state
const SkeletonCard = () => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl animate-pulse">
    <div className="h-3 w-24 bg-slate-800 rounded mb-4" />
    <div className="h-8 w-32 bg-slate-800 rounded mb-4" />
    <div className="h-2 w-full bg-slate-800 rounded" />
  </div>
);

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(100000);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isSystemOnline, setIsSystemOnline] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('https://2sstn25gtnro7ha6i2h4j7r66a0yxsym.lambda-url.us-east-1.on.aws/health');
        if (res.ok) setIsSystemOnline(true);
        else setIsSystemOnline(false);
      } catch (err) {
        setIsSystemOnline(false);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateRevenueLoss = (latency: number) => {
    const impactPercentage = (latency / 1000) * 0.10;
    const monthlyLoss = monthlyRevenue * impactPercentage;
    return monthlyLoss.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  };

  const startAudit = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // ensure the URL includes the protocol if the user forgot it
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;

      const response = await fetch(`https://2sstn25gtnro7ha6i2h4j7r66a0yxsym.lambda-url.us-east-1.on.aws/audit?url=${formattedUrl}&device=${device}`, {
        headers: {
          // This will be empty on your laptop until you set it up
          'x-api-key': process.env.NEXT_PUBLIC_AUDIT_SECRET || 'fallback_key_for_local_dev'
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Audit failed. Ensure the URL is correct.");
      }
      setResults(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Audit failed", err);
    } finally {
      setLoading(false);
    }
  };

  const totalBloat = results?.slowestApps?.reduce((acc: number, app: any) => acc + app.ms, 0) || 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans">
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md px-8 py-4 flex justify-center items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-500">
          <Zap size={24} fill="currentColor" />
          <span>Latency Lab</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">
        <section className="text-center space-y-10">
          <div className="space-y-6">
            {/* Dynamic Status Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest transition-all duration-500 ${isSystemOnline
              ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
              <Activity size={14} />
              {isSystemOnline ? 'System Online: Puppeteer Engine Active' : 'System Offline: Check Backend Connection'}
            </div>
            <h2 className="text-6xl font-black text-white leading-tight tracking-tight">
              Stop losing sales to <span className="text-blue-500">App Bloat</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              Every <span className="text-white font-bold">100ms</span> of latency costs e-commerce brands <span className="text-red-500 font-bold">1% in conversions.</span>
            </p>
          </div>

          <div className="space-y-1 pt-4">
            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-blue-500/80">
              Industry Performance Benchmarks
            </h3>
            <p className="text-sm text-slate-500 font-medium italic">
              How site speed dictates your growth, retention, and bottom line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-6xl mx-auto px-4">
            {[
              { icon: <BarChart3 size={20} />, label: "Google Study", text: "Sub-2s Load = 15% More Google Traffic*", color: "blue" },
              { icon: <TrendingDown size={20} />, label: "Akamai Data", text: "Avg. 103% Bounce rate after 2s of Latency*", color: "red" },
              { icon: <MousePointer2 size={20} />, label: "Amazon Metric", text: "Every 100ms of latency = ~1% Revenue Impact*", color: "green" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm flex items-center gap-4 text-left hover:bg-white/10 transition-colors">
                <div className={`bg-${item.color}-500/20 p-2 rounded-lg text-${item.color}-400`}>{item.icon}</div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.label}</p>
                  <p className="text-base font-semibold text-slate-200">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 max-w-2xl mx-auto mt-4 italic leading-relaxed">
            * Metrics based on historical industry studies (Akamai, Google, Amazon). Actual conversion impact
            varies by industry, average order value (AOV), and customer intent. These figures are
            simulated estimates intended for performance benchmarking.
          </p>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center items-center gap-2">
              <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex gap-1">
                <button onClick={() => setDevice('desktop')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${device === 'desktop' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Monitor size={14} /> DESKTOP</button>
                <button onClick={() => setDevice('mobile')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${device === 'mobile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><TabletSmartphone size={14} /> MOBILE (4G)</button>
              </div>
              <div className="group relative">
                <Info size={16} className="text-slate-500 cursor-help hover:text-blue-400 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-3 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 text-left">
                  <p className="text-[11px] leading-relaxed text-slate-300"><span className="text-blue-400 font-bold block mb-1 uppercase tracking-tighter">Under the Hood:</span>Mobile mode simulates a <span className="text-white font-bold">4x slower CPU</span> and <span className="text-white font-bold">4G network latency</span> to reveal real-world performance.</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                </div>
              </div>
            </div>

            <div className="relative flex items-center group">
              <Globe className="absolute left-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input type="text" placeholder="Enter URL (e.g., gymshark.com)" className="w-full pl-12 pr-32 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-lg shadow-2xl" value={url} onChange={(e) => setUrl(e.target.value)} />
              <button onClick={startAudit} disabled={loading || !isSystemOnline} className="absolute right-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-slate-700 disabled:text-slate-400 shadow-lg">
                {loading ? <Activity className="animate-spin" size={18} /> : <Search size={18} />}
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </section>

        {/* LOADING SKELETON STATE */}
        {loading && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="relative">
                <Activity size={24} className="text-blue-500 animate-spin" />
                <div className="absolute inset-0 blur-sm bg-blue-500/20 animate-pulse rounded-full" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                  Audit in Progress
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Simulating {device} hardware & intercepting 3rd party network requests...
                </p>
              </div>
            </div>

            <div className="h-32 w-full bg-white/5 rounded-3xl border border-white/10 animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400">Simulation Settings</h4>
                  <p className="text-slate-400 text-xs italic">Adjust your monthly revenue to calibrate the potential loss.</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">${(monthlyRevenue).toLocaleString()}</span>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Monthly Revenue Baseline</p>
                </div>
              </div>
              <input type="range" min="10000" max="1000000" step="10000" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Slowest Individual App</p>
                  <h3 className="text-4xl font-black text-red-600">{(results?.slowestApps?.[0]?.ms || 0).toFixed(2)}ms</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Single biggest performance bottleneck</p>
                </div>
                <div className="bg-red-50 p-3 rounded-full text-red-600">
                  <Zap size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Script Bloat</p>
                  <h3 className="text-4xl font-black text-blue-600">{(totalBloat / 1000).toFixed(2)}s</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Combined delay from {results?.summary?.apps} apps</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                  <Activity size={24} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 flex items-center justify-between group relative transition-all">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider italic">Potential Revenue Loss</p>
                    <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-black tracking-tighter uppercase">
                      BASELINE: ${(monthlyRevenue / 1000)}K/MO
                    </div>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900">
                    {calculateRevenueLoss(totalBloat)}
                    <span className="text-xs text-slate-400 font-normal ml-1 tracking-normal uppercase italic">/mo</span>
                  </h3>
                  <p className="mt-2 text-[10px] text-slate-400 leading-tight border-t border-slate-50 pt-2 font-medium">
                    <span className="text-red-400 font-bold underline italic">Cumulative Impact:</span> Every 1s of total bloat = ~10% sales drop.
                  </p>
                </div>
                <div className="bg-red-600 p-3 rounded-full text-white shadow-lg shadow-red-200">
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> The "Wall of Shame"</h4>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Audit Data</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm uppercase text-slate-400 font-bold border-b border-slate-100">
                    <th className="px-6 py-4">App Hostname</th>
                    <th className="px-6 py-4">Type & Recommendation</th>
                    <th className="px-6 py-4 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.slowestApps.map((app: any, i: number) => {
                    const advice = getAdvice(app.hostname);
                    return (
                      <tr key={i} className="hover:bg-blue-500/5 transition-all duration-300 group cursor-default">
                        <td className="px-6 py-5 font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {app.hostname}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${advice.color}`}>{advice.label}</span>
                            <p className="text-[11px] text-slate-500">{advice.tip}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`px-4 py-1.5 rounded-xl font-black text-sm ${app.ms > 200 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {app.ms.toFixed(2)} ms
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50 text-amber-800 text-sm font-semibold">
                    <td colSpan={3} className="px-6 py-3 border-t border-amber-200">
                      <span className="inline-flex items-center gap-2 text-xs ">
                        <strong>Disclaimer:</strong> The "Wall of Shame" shows relative script impacts using live audit timing data. Actual performance may differ across networks, devices, and browser versions.
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}