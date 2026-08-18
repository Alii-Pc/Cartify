"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Paperclip } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import dynamic from 'next/dynamic';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type Message = {
  id: string;
  sender: "user" | "admin";
  text: string;
  imageUrl?: string;
  timestamp: number;
  isEdited?: boolean;
};

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize or retrieve Chat ID
  useEffect(() => {
    let currentId = localStorage.getItem("cartify_chat_id");
    if (!currentId) {
      currentId = `anon_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("cartify_chat_id", currentId);
    }
    // If user logs in, link their ID
    if (user && user.id) {
      currentId = `user_${user.id}`;
    }
    setChatId(currentId);
  }, [user]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId || !database) return;

    const chatRef = ref(database, `chats/${chatId}/messages`);
    
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgList: Message[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(msgList);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  // Listen for external open events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-live-chat', handleOpen);
    return () => window.removeEventListener('open-live-chat', handleOpen);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !chatId || !database) return;

    const chatRef = ref(database, `chats/${chatId}`);
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);

    const msgData = {
      sender: "user",
      text: message.trim(),
      timestamp: serverTimestamp(),
    };

    setMessage("");

    // Update the message
    await set(newMessageRef, msgData);
    
    // Update chat metadata for admin
    await set(ref(database, `chats/${chatId}/meta`), {
      lastMessage: msgData.text,
      lastMessageTime: serverTimestamp(),
      userName: user ? user.name : "Anonymous User",
      userEmail: user ? user.email : "Not provided",
      unreadAdmin: true
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId || !database) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "cartify/chat");

    try {
      const res = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, {
          sender: "user",
          text: "",
          imageUrl: data.data.secure_url,
          timestamp: serverTimestamp(),
        });
        
        await set(ref(database, `chats/${chatId}/meta`), {
          lastMessage: "Sent an image",
          lastMessageTime: serverTimestamp(),
          userName: user ? user.name : "Anonymous User",
          userEmail: user ? user.email : "Not provided",
          unreadAdmin: true
        });
      } else {
        alert(data.message || "Failed to upload image");
      }
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[650px] max-h-[85vh] w-[380px] max-w-[90vw] flex-col overflow-hidden rounded-[28px] bg-[#F9F9F9] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-slideUp transition-all origin-bottom-right relative">
          
          {/* Glassy Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/[0.03] z-20 backdrop-blur-xl bg-white/70 sticky top-0">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-charcoal-700 to-charcoal-900 text-white shadow-md">
                <span className="font-bold text-sm">CS</span>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-gray-900 tracking-tight leading-none mb-1">Live Support</h3>
                <p className="text-[11.5px] font-medium text-charcoal-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Team is online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-900 transition-all focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 relative scroll-smooth bg-gradient-to-b from-transparent to-[#F3F4F6]/50">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4 px-4 pb-10">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-xl shadow-charcoal-900/5 rotate-3 transition-transform hover:rotate-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/80 to-transparent rounded-[24px]"></div>
                  <MessageSquare className="h-9 w-9 text-charcoal-700 relative z-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-lg text-gray-900 tracking-tight">How can we help?</h4>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] mx-auto">
                    Send us a message and one of our customer support agents will be with you shortly.
                  </p>
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
                          <div className={`h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-charcoal-700 to-charcoal-900 font-bold text-[10px] text-white flex items-center justify-center shadow-sm ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                            CS
                          </div>
                        )}
                        
                        <div className={`text-[14px] leading-relaxed whitespace-pre-wrap ${
                          isUser 
                            ? "bg-gradient-to-tr from-charcoal-800 to-charcoal-900 text-white rounded-[22px] rounded-br-[6px] px-5 py-3.5 shadow-md" 
                            : "bg-white border border-gray-100/80 text-gray-800 rounded-[22px] rounded-tl-[6px] px-5 py-3.5 shadow-sm"
                        }`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="attachment" className="max-w-[200px] max-h-[250px] object-cover rounded-xl mb-2 border border-black/5" />
                          )}
                          {msg.text}
                        </div>
                      </div>
                      <div className={`text-[10px] text-gray-400 mt-1.5 font-medium ${isUser ? "mr-2" : "ml-10"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 before:absolute before:inset-0 before:bg-gradient-to-t before:from-[#F9F9F9] before:via-[#F9F9F9]/95 before:to-transparent before:backdrop-blur-md before:-z-10">
            {showEmoji && (
              <div className="absolute bottom-[80px] right-5 shadow-2xl z-50 rounded-[24px] overflow-hidden border border-black/5">
                <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <form onSubmit={handleSend} className="relative flex items-center bg-white border border-gray-200/80 rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] focus-within:ring-2 focus-within:ring-charcoal-500/10 focus-within:border-charcoal-300 transition-all">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-charcoal-700 hover:bg-gray-100 transition-colors ml-1 disabled:opacity-50"
              >
                 <Paperclip className="h-4 w-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setShowEmoji(!showEmoji)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:text-charcoal-700 hover:bg-gray-100 transition-colors"
              >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isUploading ? "Uploading..." : "Message support..."}
                disabled={isUploading}
                className="flex-1 bg-transparent px-3 py-2 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() && !isUploading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-charcoal-800 to-charcoal-900 text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:opacity-40 disabled:from-gray-400 disabled:to-gray-400 shrink-0 shadow-md ml-1"
              >
                <Send className="h-[18px] w-[18px] ml-0.5" />
              </button>
            </form>
            <div className="mt-3 text-center">
              <span className="text-[10px] text-gray-400/80 font-medium tracking-wide">Live Support</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
