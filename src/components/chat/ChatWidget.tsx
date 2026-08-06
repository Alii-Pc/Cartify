"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User as UserIcon } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import EmojiPicker from 'emoji-picker-react';

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[600px] w-[380px] flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-100 animate-slideUp transition-all origin-bottom-right relative pb-28">
          {/* Header */}
          <div className="flex items-center justify-between bg-white p-5 border-b border-gray-50 z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal-900 text-white font-bold text-xs">
                M
              </div>
              <div>
                <h3 className="font-bold text-sm text-charcoal-900 tracking-wide">AI Agent</h3>
                <p className="text-[11px] font-medium text-charcoal-400 flex items-center gap-1.5">
                  powered by cartify
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none"
            >
              <X className="h-5 w-5 text-charcoal-400" />
            </button>
          </div>


          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white relative">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-charcoal-400 space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-50 shadow-inner">
                  <MessageSquare className="h-8 w-8 text-olive-300" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-700">How can we help?</p>
                  <p className="text-xs mt-1 max-w-[200px]">Send us a message and we&apos;ll get right back to you.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                const showAvatar = !isUser && (index === 0 || messages[index - 1].sender === "user");
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div className="flex items-end gap-3 max-w-[85%]">
                      {!isUser && (
                        <div className={`h-6 w-6 shrink-0 rounded-full bg-charcoal-900 font-bold text-[9px] text-white flex items-center justify-center ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                          M
                        </div>
                      )}
                      
                      <div className={`text-[14px] leading-relaxed ${
                        isUser 
                          ? "bg-charcoal-900 text-white rounded-[20px] rounded-br-[4px] px-5 py-3 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]" 
                          : "bg-transparent text-charcoal-900 rounded-none px-1 py-1"
                      }`}>
                        {msg.imageUrl && (
                          <img src={msg.imageUrl} alt="attachment" className="max-w-[200px] max-h-[250px] object-cover rounded-xl mb-1" />
                        )}
                        {msg.text}
                      </div>
                    </div>
                    {isUser && (
                      <div className="text-[10px] text-gray-300 mt-1 font-medium mr-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-5 z-20">
            {showEmoji && (
              <div className="absolute bottom-[80px] right-5 shadow-2xl z-50">
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
            <form onSubmit={handleSend} className="relative flex items-center bg-white border border-gray-200 rounded-[28px] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="pl-3 pr-2 text-gray-400 hover:text-charcoal-600 transition-colors disabled:opacity-50"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <button 
                type="button" 
                onClick={() => setShowEmoji(!showEmoji)}
                className="pr-3 text-gray-400 hover:text-charcoal-600 transition-colors"
              >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isUploading ? "Uploading..." : "Hello..."}
                disabled={isUploading}
                className="flex-1 bg-transparent px-2 py-2 text-[15px] text-charcoal-900 placeholder:text-gray-400 focus:outline-none disabled:bg-transparent"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-white transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:bg-gray-300 shrink-0 shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              </button>
            </form>
            <div className="mt-4 text-center">
              <span className="text-[10px] text-gray-400 font-medium">AI Agent powered by <strong>cartify</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <div className="relative group">
          {/* Glowing Aura Effect */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-olive-400 via-olive-600 to-emerald-500 opacity-70 group-hover:opacity-100 blur-lg transition-opacity animate-pulse duration-1000" />
          
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-charcoal-900 via-olive-800 to-olive-700 text-white shadow-[0_0_20px_rgba(0,0,0,0.2)] ring-2 ring-white/20 transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            <MessageSquare className="h-6 w-6 relative z-10" />
            
            {/* Dynamic Unread Badge */}
            {messages.length > 0 && messages[messages.length - 1].sender === "admin" && (
              <div className="absolute top-0 right-0 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full z-20 animate-bounce shadow-sm" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
