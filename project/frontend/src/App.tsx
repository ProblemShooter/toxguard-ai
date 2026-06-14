import React, { useState, useEffect } from 'react';
import { api, type PredictionResponse } from './api';
import { Shield, ShieldAlert, Send, Clock, Trash2, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface HistoryItem extends PredictionResponse {
  id: string;
  timestamp: number;
}

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('toxicity_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
    
    // Check backend health
    api.checkHealth().then(() => setServerHealthy(true)).catch(() => setServerHealthy(false));
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('toxicity_history', JSON.stringify(newHistory));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.predict(text);
      const newItem: HistoryItem = {
        ...result,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };
      saveHistory([newItem, ...history].slice(0, 10)); // Keep last 10
      setText('');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to connect to the server. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (item: HistoryItem) => {
    const textToCopy = `Text: "${item.text}"\nResult: ${item.is_toxic ? 'Toxic' : 'Safe'}\nBreakdown: ${Object.entries(item.predictions)
      .map(([k, v]) => `${k} (${(v.probability * 100).toFixed(1)}%)`)
      .join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-surface/50 bg-surface/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              ToxGuard AI
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="relative flex h-3 w-3">
              {serverHealthy && (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-safe opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-safe"></span>
                </>
              )}
              {serverHealthy === false && <span className="relative inline-flex rounded-full h-3 w-3 bg-toxic"></span>}
              {serverHealthy === null && <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>}
            </span>
            <span className="hidden sm:inline-block">
              {serverHealthy ? 'System Operational' : serverHealthy === false ? 'API Offline' : 'Checking status...'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Input Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface/30 border border-surface/50 rounded-2xl p-1 shadow-xl backdrop-blur-sm">
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Analyze Text</h2>
                <p className="text-slate-400 text-sm mt-1">Detect toxicity, insults, and threats using deep learning.</p>
              </div>

              <form onSubmit={handlePredict} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (text.trim()) {
                          handlePredict(e as any);
                        }
                      }
                    }}
                    placeholder="Type or paste a comment here..."
                    className="w-full h-40 bg-background/50 border border-surface rounded-xl p-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                    disabled={loading}
                  />
                  {text.length > 0 && (
                    <span className="absolute bottom-3 right-3 text-xs text-slate-500 bg-background/80 px-2 py-1 rounded-md">
                      {text.length} chars
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      className="bg-toxic/10 border border-toxic/20 text-toxic-400 rounded-lg p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-toxic shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    className="group relative flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        Analyze Comment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Latest Result Banner if available */}
          <AnimatePresence>
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={clsx(
                  "border rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden",
                  history[0].is_toxic 
                    ? "bg-toxic/5 border-toxic/20" 
                    : "bg-safe/5 border-safe/20"
                )}
              >
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className={clsx(
                    "p-3 rounded-xl",
                    history[0].is_toxic ? "bg-toxic/20 text-toxic" : "bg-safe/20 text-safe"
                  )}>
                    {history[0].is_toxic ? <ShieldAlert className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">
                      {history[0].is_toxic ? 'Toxicity Detected' : 'Content looks safe'}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-1 max-w-md mt-1">"{history[0].text}"</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative z-10">
                  {Object.entries(history[0].predictions).map(([category, data]) => (
                    <div 
                      key={category} 
                      className="bg-background/40 border border-surface rounded-lg p-3 flex flex-col gap-1"
                    >
                      <span className="text-xs font-medium text-slate-400 capitalize">
                        {category.replace('_', ' ')}
                      </span>
                      <div className="flex items-end justify-between">
                        <span className={clsx(
                          "text-lg font-bold",
                          data.flag ? "text-toxic" : "text-slate-300"
                        )}>
                          {(data.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-surface/50 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            data.flag ? "bg-toxic shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary/50"
                          )}
                          style={{ width: `${data.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column - History Area */}
        <div className="lg:col-span-5">
          <div className="bg-surface/20 border border-surface/50 rounded-2xl h-full p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Recent Scans</h3>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-slate-500 hover:text-toxic transition-colors p-1.5 rounded-lg hover:bg-surface/50"
                  title="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 opacity-50 pb-20">
                  <Shield className="w-12 h-12" />
                  <p className="text-sm text-center">No history yet.<br/>Scan a comment to see results.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group bg-background/50 border border-surface/50 hover:border-surface rounded-xl p-4 transition-all relative overflow-hidden"
                    >
                      {/* Status indicator bar */}
                      <div className={clsx(
                        "absolute left-0 top-0 bottom-0 w-1",
                        item.is_toxic ? "bg-toxic" : "bg-safe"
                      )} />
                      
                      <div className="flex justify-between items-start gap-4 mb-2 pl-2">
                        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                          "{item.text}"
                        </p>
                        <button
                          onClick={() => copyToClipboard(item)}
                          className="text-slate-500 hover:text-slate-300 p-1 rounded-md transition-colors bg-surface/50 opacity-0 group-hover:opacity-100"
                        >
                          {copiedId === item.id ? <Check className="w-4 h-4 text-safe" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pl-2">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.predictions)
                            .filter(([, data]) => data.flag)
                            .map(([cat]) => (
                              <span key={cat} className="text-[10px] uppercase tracking-wider font-semibold bg-toxic/20 text-toxic px-2 py-0.5 rounded-sm">
                                {cat.replace('_', ' ')}
                              </span>
                            ))}
                          {!item.is_toxic && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold bg-safe/20 text-safe px-2 py-0.5 rounded-sm">
                              Clean
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-600">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
