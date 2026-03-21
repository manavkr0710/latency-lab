"use client";
import { useState } from 'react';
import { Search, Zap, AlertTriangle, Globe, Activity } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const startAudit = async () => {
    if (!url) return;
    setLoading(true);
    try {
      // Temporary: We will link this to your Actual Backend in the next step
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
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Header */}
      <nav className="border-b bg-white px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Zap size={24} fill="currentColor" />
          <span>Latency Lab</span>
        </div>
        <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
          Shopify App Auditor v1.0
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
        {/* Search Section */}
        <section className="text-center space-y-6">
          <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
            Stop losing sales to <span className="text-blue-600">App Bloat</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Analyze any Shopify store to identify 3rd-party scripts slowing down your customer experience.
          </p>
          
          <div className="max-w-2xl mx-auto relative flex items-center group">
            <Globe className="absolute left-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Enter URL (e.g., gymshark.com)"
              className="w-full pl-12 pr-32 py-4 rounded-2xl border border-slate-200 shadow-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={startAudit}
              disabled={loading}
              className="absolute right-2 bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 disabled:bg-slate-300"
            >
              {loading ? <Activity className="animate-spin" size={18} /> : <Search size={18} />}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </section>

        {/* Results Section (Only shows when results exist) */}
        {results && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase italic">Total Third-Party Apps</p>
                  <h3 className="text-3xl font-black text-slate-900">{results.summary.apps}</h3>
                </div>
                <AlertTriangle size={40} className="text-amber-500 opacity-20" />
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-semibold uppercase italic">Slowest App Latency</p>
                  <h3 className="text-3xl font-black text-red-600">{results.slowestApps[0]?.ms}ms</h3>
                </div>
                <Zap size={40} className="text-red-500 opacity-20" />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50">
                <h4 className="font-bold text-slate-700">The "Wall of Shame" (Top 10 Slowest Apps)</h4>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 font-bold border-b">
                    <th className="px-6 py-4">App Hostname</th>
                    <th className="px-6 py-4 text-right">Impact (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.slowestApps.map((app: any, i: number) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-700">{app.hostname}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${app.ms > 200 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
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