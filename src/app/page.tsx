"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { parseNordeaCSV } from "@/lib/parser";
import { analyzeTransactions } from "@/lib/analyzer";

export default function FinanceCatHome() {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [insight, setInsight] = useState("");

  const getDynamicColor = (index: number, total: number) => {
    const hue = (index * (360 / Math.max(total, 1))) % 360;
    return `hsl(${hue}, 35%, 45%)`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const transactions = await parseNordeaCSV(file);
      const result = await analyzeTransactions(transactions);
      setAnalysisData(result);
      setInsight(result.summary);
    } catch (error) { 
      setInsight("The audit was interrupted."); 
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] text-[#1A1A1A] p-8 md:p-20 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-20 text-center">
          <div className="uppercase tracking-[0.5em] text-[10px] text-zinc-400 font-bold mb-8">
             Audit — Report
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic text-zinc-900 leading-tight max-w-3xl mx-auto">
            {insight || "Present your ledger for a formal review."}
          </h1>
        </header>

        {analysisData && (
          <div className="space-y-24 pb-40">
            
            {/* 1. 图表与完整分类图例 (5-8个) */}
            <section className="grid lg:grid-cols-2 gap-20 items-center border-y border-zinc-100 py-16">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={analysisData.categories} 
                      innerRadius={80} 
                      outerRadius={120} 
                      paddingAngle={4}
                      dataKey="amount" 
                      stroke="none"
                    >
                      {analysisData.categories.map((_: any, i: number) => (
                        <Cell key={i} fill={getDynamicColor(i, analysisData.categories.length)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-6 font-bold">Allocations</h3>
                {analysisData.categories.map((cat: any, i: number) => (
                  <div key={i} className="flex items-end justify-between border-b border-zinc-100 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: getDynamicColor(i, analysisData.categories.length) }} />
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500">{cat.name}</span>
                    </div>
                    <span className="text-lg font-serif italic tabular-nums">{cat.amount}€</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. 核心建议 (1 Advice) */}
            <div className="bg-[#F5F1E6] border border-[#D4A373]/20 p-12 rounded-sm">
              <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#A98467] font-bold mb-4 text-center">Strategic Advice</h4>
              <p className="text-2xl font-serif italic text-[#5C4033] text-center leading-relaxed">
                {analysisData.recommendation}
              </p>
            </div>

            {/* 3. 精选观察卡片 (少于6条) */}
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-20">
              {analysisData.categories
                .filter((cat: any) => cat.remark && cat.remark.length > 0) // 只显示有评论的
                .slice(0, 5) // 再次确保不超过5个
                .map((cat: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">{cat.name}</span>
                      <div className="h-[1px] flex-grow mx-4 bg-zinc-100" />
                    </div>
                    <p className="text-lg text-zinc-800 font-serif italic leading-relaxed">
                      "{cat.remark}"
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Floating Upload Button */}
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
          <label className="flex items-center gap-6 bg-black text-white px-10 py-4 rounded-full shadow-2xl cursor-pointer hover:bg-zinc-800 transition-all active:scale-95 group">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
              {loading ? "Processing..." : "Import Statement"}
            </span>
            <input type="file" className="hidden" accept=".csv" onChange={handleUpload} />
          </label>
        </div>
      </div>
    </main>
  );
}