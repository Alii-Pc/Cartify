"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Bot, Calendar, Sparkles } from "lucide-react";

type FAQ = {
  question: string;
  count: number;
  category: string;
};

export function AIFaqView() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("30"); // 7, 30, 90, all

  useEffect(() => {
    fetchFaqs();
  }, [filter]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai/faqs?days=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data.topQuestions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mostAsked = faqs.length > 0 ? faqs[0] : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden rounded-3xl border border-olive-100 bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
            <Bot className="h-6 w-6 text-olive-600" />
            AI Frequently Asked Questions
          </h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Analyze the most common questions customers ask your AI.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
          <Calendar className="h-4 w-4 text-gray-400 ml-2" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-charcoal-700 p-1.5 focus:outline-none cursor-pointer"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-olive-500" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {mostAsked && (
              <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-olive-200 font-semibold text-sm flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-4 w-4" /> Most Asked Question
                    </h3>
                    <p className="text-2xl font-bold">{mostAsked.question}</p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 shrink-0 text-center">
                    <span className="block text-2xl font-bold">{mostAsked.count}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-70">times</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80">
                    <th className="py-4 px-5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider w-16">#</th>
                    <th className="py-4 px-5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Question</th>
                    <th className="py-4 px-5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider w-40">Category</th>
                    <th className="py-4 px-5 text-xs font-semibold text-charcoal-500 uppercase tracking-wider text-right w-24">Asked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faqs.map((faq, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5 text-sm font-medium text-gray-400">{idx + 1}</td>
                      <td className="py-4 px-5 text-sm font-semibold text-charcoal-800">{faq.question}</td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-olive-100 text-olive-800">
                          {faq.category}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-bold text-charcoal-600 text-right">{faq.count}</td>
                    </tr>
                  ))}
                  {faqs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-500">
                        No AI chat questions found for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
