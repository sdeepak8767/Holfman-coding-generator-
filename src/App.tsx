import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, 
  Binary, 
  Info, 
  BarChart3, 
  TreePine, 
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { HuffmanResult, HuffmanNode } from "./types";

const TreeVisualizer = ({ node, code = "" }: { node: HuffmanNode; code?: string }) => {
  if (!node) return null;

  const isLeaf = node.char !== undefined;

  return (
    <div className="flex flex-col items-center">
      <div className={`
        relative flex flex-col items-center justify-center p-3 rounded-lg border-2 
        ${isLeaf ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}
        transition-all hover:scale-105 group
      `}>
        <span className="text-xs font-mono text-slate-400 mb-1">freq: {node.freq}</span>
        {isLeaf ? (
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-emerald-700">
              {node.char === " " ? "Space" : node.char}
            </span>
            <span className="text-[10px] font-mono text-emerald-500 mt-1">{code}</span>
          </div>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-300 rounded-full" />
          </div>
        )}
      </div>

      {!isLeaf && (
        <div className="flex mt-8 gap-8 relative">
          <div className="flex flex-col items-center">
            <div className="h-4 w-px bg-slate-300 absolute -top-4 left-1/4" />
            <TreeVisualizer node={node.left!} code={code + "0"} />
          </div>
          <div className="flex flex-col items-center">
            <div className="h-4 w-px bg-slate-300 absolute -top-4 right-1/4" />
            <TreeVisualizer node={node.right!} code={code + "1"} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [text, setText] = useState("huffman coding is efficient");
  const [result, setResult] = useState<HuffmanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateHuffman = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/huffman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Failed to generate coding");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) generateHuffman();
    }, 500);
    return () => clearTimeout(timer);
  }, [text]);

  const copyCodes = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.codes, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Binary size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Huffman Architect</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Data Compression Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://en.wikipedia.org/wiki/Huffman_coding" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <Info size={20} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Source Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-40 p-4 rounded-xl bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none font-mono text-sm outline-none"
                placeholder="Enter text to compress..."
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {text.length} characters
                </span>
                {loading && (
                  <RefreshCw size={16} className="text-emerald-500 animate-spin" />
                )}
              </div>
            </section>

            {result && (
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 size={18} className="text-emerald-600" />
                  <h2 className="font-bold">Compression Metrics</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Original Size</span>
                      <span className="font-mono font-semibold">{result.originalSize} bits</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-300 w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Compressed Size</span>
                      <span className="font-mono font-semibold text-emerald-600">{result.compressedSize} bits</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.compressedSize / result.originalSize) * 100}%` }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Efficiency</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-600">
                        {result.compressionRatio.toFixed(2)}x
                      </span>
                      <Zap size={20} className="text-amber-400 fill-amber-400" />
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column: Visualization */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Codes Table */}
                  <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Binary size={18} className="text-emerald-600" />
                        <h2 className="font-bold">Generated Mappings</h2>
                      </div>
                      <button 
                        onClick={copyCodes}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-wider"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? "Copied" : "Copy JSON"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-px bg-slate-100">
                      {Object.entries(result.codes).map(([char, code]) => (
                        <div key={char} className="bg-white p-4 flex flex-col items-center justify-center group hover:bg-slate-50 transition-colors">
                          <span className="text-lg font-bold text-slate-700 mb-1">
                            {char === " " ? "␣" : char}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-500 font-bold tracking-tighter">
                            {code}
                          </span>
                          <span className="text-[9px] text-slate-300 mt-1">
                            {result.frequencies[char]}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Tree Visualization */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
                    <div className="flex items-center gap-2 mb-8">
                      <TreePine size={18} className="text-emerald-600" />
                      <h2 className="font-bold">Huffman Tree Structure</h2>
                    </div>
                    <div className="min-w-max flex justify-center py-8">
                      <TreeVisualizer node={result.tree} />
                    </div>
                  </section>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[600px] flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400"
                >
                  <Binary size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">Enter text to visualize the coding tree</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Binary size={16} />
            <span className="text-xs font-mono">HUFFMAN_ARCHITECT_v1.0</span>
          </div>
          <div className="flex gap-8">
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-slate-600">Engine Ready</span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Algorithm</p>
              <span className="text-xs font-medium text-slate-600">Greedy Optimal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
