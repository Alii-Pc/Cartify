"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User as UserIcon, Sparkles, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmojiPicker from 'emoji-picker-react';

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  imageUrl?: string;
  timestamp: number;
};

export function AIChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cartify_ai_chat");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  // Save chat history to local storage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("cartify_ai_chat", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: message.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setMessage("");
    setIsTyping(true);
    setError(null);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMsg.text,
          history: history,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(data.error || "Failed to get a response from AI.");
      }
    } catch (err) {
      setError("An error occurred while connecting to the AI.");
    } finally {
      setIsTyping(false);
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setMessage((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[650px] max-h-[85vh] w-[380px] max-w-[90vw] flex-col overflow-hidden rounded-[28px] bg-[#F9F9F9] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-slideUp transition-all origin-bottom-right relative">
          
          {/* Glassy Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/[0.03] z-20 backdrop-blur-xl bg-white/80 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-olive-800 text-cream-50 shadow-sm">
                <Sparkles className="h-4 w-4 text-cream-50" />
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-charcoal-900 tracking-tight leading-none mb-1">Shopping Assistant</h3>
                <p className="text-[11px] font-medium text-olive-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 text-charcoal-400 hover:text-charcoal-900 transition-all focus:outline-none"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 relative scroll-smooth bg-gradient-to-b from-transparent to-[#F3F4F6]/50">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4 px-4 pb-10">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-xl shadow-olive-900/5 rotate-3 transition-transform hover:rotate-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-olive-100/50 to-transparent rounded-[24px]"></div>
                  <MessageSquare className="h-9 w-9 text-olive-600 relative z-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-lg text-charcoal-900 tracking-tight">Welcome to Cartify!</h4>
                  <p className="text-sm text-charcoal-500 leading-relaxed max-w-[240px] mx-auto">
                    I&apos;m your AI Shopping Assistant. Ask me for product recommendations, styling tips, or any questions!
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center mt-4">
                   <button onClick={() => setMessage("What are your bestsellers?")} className="text-[11px] font-medium bg-white border border-gray-200 text-charcoal-700 px-3 py-1.5 rounded-full hover:border-olive-300 hover:bg-olive-50 transition-colors shadow-sm">🔥 Bestsellers</button>
                   <button onClick={() => setMessage("I need a gift recommendation.")} className="text-[11px] font-medium bg-white border border-gray-200 text-charcoal-700 px-3 py-1.5 rounded-full hover:border-olive-300 hover:bg-olive-50 transition-colors shadow-sm">🎁 Gift Ideas</button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-24">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  const showAvatar = !isUser && (index === 0 || messages[index - 1]?.sender === "user");
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2 duration-300 fade-in`}>
                      <div className="flex items-end gap-2.5 max-w-[88%]">
                        {!isUser && (
                          <div className={`h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-olive-700 to-charcoal-800 text-white flex items-center justify-center shadow-sm ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                            <Sparkles className="h-3.5 w-3.5 text-olive-200" />
                          </div>
                        )}
                        
                        <div className={`text-[14px] leading-relaxed whitespace-pre-wrap ${
                          isUser 
                            ? "bg-gradient-to-tr from-charcoal-900 to-[#2A2A2A] text-white rounded-[22px] rounded-br-[6px] px-5 py-3.5 shadow-md" 
                            : "bg-white border border-gray-100/80 text-charcoal-800 rounded-[22px] rounded-tl-[6px] px-5 py-3.5 shadow-sm"
                        }`}>
                          {msg.text.split(/(!\[.*?\]\(.*?\))/g).map((part, i) => {
                            const match = part.match(/!\[(.*?)\]\((.*?)\)/);
                            if (match) {
                              return (
                                <div key={i} className="my-2 rounded-xl overflow-hidden border border-gray-200/50 shadow-sm">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={match[2]} alt={match[1]} className="w-full h-auto object-cover aspect-video bg-gray-50" />
                                </div>
                              );
                            }
                            return <span key={i}>{part}</span>;
                          })}
                        </div>
                      </div>
                      <div className={`text-[10px] text-gray-400 mt-1.5 font-medium ${isUser ? "mr-2" : "ml-10"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex flex-col items-start animate-in fade-in duration-300">
                    <div className="flex items-end gap-2.5 max-w-[85%]">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-olive-700 to-charcoal-800 text-white flex items-center justify-center shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-olive-200" />
                      </div>
                      <div className="bg-white border border-gray-100/80 rounded-[22px] rounded-tl-[6px] px-5 py-4 shadow-sm flex items-center gap-1.5 h-[48px]">
                        <span className="w-1.5 h-1.5 bg-olive-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-olive-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-olive-400 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex justify-center mt-2 animate-in fade-in">
                    <div className="text-center text-[11px] font-medium text-red-600 bg-red-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-red-100 shadow-sm">
                      {error}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 before:absolute before:inset-0 before:bg-gradient-to-t before:from-[#F9F9F9] before:via-[#F9F9F9]/95 before:to-transparent before:backdrop-blur-md before:-z-10">
            {showEmoji && (
              <div className="absolute bottom-[80px] left-5 shadow-2xl z-50 rounded-[24px] overflow-hidden border border-black/5">
                <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
              </div>
            )}
            <form onSubmit={handleSend} className="relative flex items-center bg-white border border-gray-200/80 rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-olive-500/20 focus-within:border-olive-300 transition-all">
              <button 
                type="button" 
                onClick={() => setShowEmoji(!showEmoji)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-olive-600 hover:bg-olive-50 transition-colors ml-1"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about a product..."
                disabled={isTyping}
                className="flex-1 bg-transparent px-3 py-2 text-[14px] text-charcoal-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || isTyping}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-olive-700 to-charcoal-900 text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-40 disabled:from-gray-400 disabled:to-gray-400 shrink-0 shadow-md ml-1"
              >
                <Send className="h-[18px] w-[18px] ml-0.5" />
              </button>
            </form>
            <div className="mt-3 text-center">
              <span className="text-[10px] text-gray-400/80 font-medium tracking-wide">AI replies may not be 100% accurate</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Minimalist AI Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Shopping Assistant"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-olive-800 text-cream-50 shadow-lg shadow-olive-950/20 transition-all duration-200 hover:bg-olive-900 hover:scale-105 active:scale-95 border border-olive-700/40"
        >
          <Sparkles className="h-6 w-6 text-cream-50" />

          {/* Subtle online status dot */}
          <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      )}
    </div>
  );
}
