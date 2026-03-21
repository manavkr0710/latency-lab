"use client";
import { useState } from 'react';
import { Search, Zap, AlertTriangle, Globe, Activity, Info, BarChart3, TrendingDown, MousePointer2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const calculateRevenueLoss = (latency: number) => {
    // methodology: 1 second (1000ms) of lag = 10% conversion drop/10% revenue loss
    const impactPercentage = (latency / 1000) * 0.10;
    
    // monthly baseline revenue for a mid-market Shopify store
    const monthlyBaseline = 100000; 
    const monthlyLoss = monthlyBaseline * impactPercentage;
    
    return monthlyLoss.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    });
  };

  const startAudit = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/audit?url=${url}`);
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Audit failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-500">
          <Zap size={24} fill="currentColor" />
          <span>Latency Lab</span>
        </div>
        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Shopify App Auditor v1.0
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">
        {/* Search & Hook Section */}
        <section className="text-center space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                <Activity size={14} /> System Online: Puppeteer Engine Active
            </div>
            <h2 className="text-6xl font-black text-white leading-tight tracking-tight">
              Stop losing sales to <span className="text-blue-500">App Bloat</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
              Every <span className="text-white font-bold">100ms</span> of latency costs e-commerce brands <span className="text-red-500 font-bold">1% in conversions.</span>
            </p>
          </div>

          {/*Industry Benchmarks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm flex items-center gap-4 text-left hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Akamai Data</p>
                <p className="text-sm font-semibold text-slate-200">1s Delay = 7% Drop in Sales</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm flex items-center gap-4 text-left hover:bg-white/10 transition-colors">
              <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                <TrendingDown size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Google Study</p>
                <p className="text-sm font-semibold text-slate-200">53% Bounce rate after 3s</p>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm flex items-center gap-4 text-left hover:bg-white/10 transition-colors">
              <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                <MousePointer2 size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Amazon Metric</p>
                <p className="text-sm font-semibold text-slate-200">100ms lag = 1% Revenue Loss</p>
              </div>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto relative flex items-center group pt-4">
            <Globe className="absolute left-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Enter URL (e.g., gymshark.com)"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-500 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-lg shadow-2xl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={startAudit}
              disabled={loading}
              className="absolute right-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-slate-700 disabled:text-slate-400 shadow-lg"
            >
              {loading ? <Activity className="animate-spin" size={18} /> : <Search size={18} />}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Apps */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between transition-all">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 text-left">Total Third-Party Apps</p>
                  <h3 className="text-4xl font-black text-slate-900 text-left">{results?.summary?.apps || 0}</h3>
                </div>
                <div className="bg-amber-50 p-3 rounded-full text-amber-500">
                  <AlertTriangle size={24} />
                </div>
              </div>

              {/* Slowest App */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between transition-all">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 text-left">Slowest App Latency</p>
                  <h3 className="text-4xl font-black text-red-600 text-left">{results?.slowestApps?.[0]?.ms || 0}ms</h3>
                </div>
                <div className="bg-red-50 p-3 rounded-full text-red-600">
                  <Activity size={24} />
                </div>
              </div>

              {/* Revenue Loss */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 flex items-center justify-between group relative transition-all">
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider italic">Potential Revenue Loss</p>
                    <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-black tracking-tighter">
                      BASELINE: $100K/MO
                    </div>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900">
                    {results?.slowestApps?.[0]?.ms ? calculateRevenueLoss(results.slowestApps[0].ms) : "$0.00"}
                    <span className="text-xs text-slate-400 font-normal ml-1 tracking-normal uppercase italic">/mo</span>
                  </h3>
                  <p className="mt-2 text-[10px] text-slate-400 leading-tight border-t border-slate-50 pt-2 font-medium">
                    <span className="text-red-400 font-bold underline italic">Formula:</span> (Latency / 1000ms) * 10% of Monthly Sales
                  </p>
                </div>
                <div className="bg-red-600 p-3 rounded-full text-white shadow-lg shadow-red-200">
                  <Zap size={24} fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-slate-900">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  The "Wall of Shame" (Top 10 Slowest Apps)
                </h4>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Audit Data</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                    <th className="px-6 py-4">App Hostname</th>
                    <th className="px-6 py-4 text-right">Network Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.slowestApps.map((app: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-700 tracking-tight">{app.hostname}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${app.ms > 200 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {app.ms} ms
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}