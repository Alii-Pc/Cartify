"use client";

import React, { useState, useEffect, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { Send, User as UserIcon, Clock, CheckCircle, MessageSquare } from "lucide-react";

type ChatMeta = {
  lastMessage: string;
  lastMessageTime: number;
  userName: string;
  userEmail: string;
  unreadAdmin: boolean;
};

type ChatSession = {
  id: string;
  meta: ChatMeta;
};

type Message = {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: number;
};

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all chat metadata
  useEffect(() => {
    if (!database) return;
    
    const chatsRef = ref(database, "chats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sessionList: ChatSession[] = Object.keys(data).map((key) => ({
          id: key,
          meta: data[key].meta || {},
        })).filter(s => s.meta.lastMessageTime) // Only show active chats
        .sort((a, b) => b.meta.lastMessageTime - a.meta.lastMessageTime); // Newest first
        
        setSessions(sessionList);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to active chat messages
  useEffect(() => {
    if (!activeChatId || !database) {
      setMessages([]);
      return;
    }

    const messagesRef = ref(database, `chats/${activeChatId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const msgList: Message[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    // Mark as read
    const metaRef = ref(database, `chats/${activeChatId}/meta/unreadAdmin`);
    set(metaRef, false);

    return () => unsubscribe();
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeChatId || !database) return;

    const messagesRef = ref(database, `chats/${activeChatId}/messages`);
    const newMessageRef = push(messagesRef);

    const msgData = {
      sender: "admin",
      text: reply.trim(),
      timestamp: serverTimestamp(),
    };

    setReply("");
    await set(newMessageRef, msgData);
    
    // Update meta
    await set(ref(database, `chats/${activeChatId}/meta/lastMessage`), msgData.text);
    await set(ref(database, `chats/${activeChatId}/meta/lastMessageTime`), serverTimestamp());
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden rounded-2xl border border-olive-200 bg-white shadow-sm">
      
      {/* Sidebar - Chat List */}
      <div className="w-1/3 border-r border-olive-100 bg-gray-50/30 flex flex-col">
        <div className="p-4 border-b border-olive-100 bg-white">
          <h2 className="font-bold text-charcoal-900">Live Support</h2>
          <p className="text-xs text-charcoal-500">{sessions.length} active chats</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveChatId(session.id)}
              className={`w-full text-left p-4 border-b border-olive-50 transition-colors flex items-start gap-3 ${
                activeChatId === session.id ? 'bg-olive-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative mt-1 flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                  <UserIcon className="h-5 w-5" />
                </div>
                {session.meta.unreadAdmin && (
                  <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-charcoal-900 truncate">
                    {session.meta.userName || 'Anonymous User'}
                  </h3>
                  <span className="text-xs text-charcoal-400 shrink-0">
                    {session.meta.lastMessageTime ? new Date(session.meta.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className={`text-sm truncate ${session.meta.unreadAdmin ? 'font-medium text-charcoal-900' : 'text-charcoal-500'}`}>
                  {session.meta.lastMessage}
                </p>
              </div>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="p-8 text-center text-charcoal-400 text-sm">
              No active chats at the moment.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChatId ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-olive-100 p-4">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                <UserIcon className="h-5 w-5" />
             </div>
             <div>
               <h2 className="font-bold text-charcoal-900">
                 {sessions.find(s => s.id === activeChatId)?.meta.userName || 'Anonymous User'}
               </h2>
               <p className="text-xs text-charcoal-500">
                 {sessions.find(s => s.id === activeChatId)?.meta.userEmail || 'No email provided'}
               </p>
             </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fafafa]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                  msg.sender === "admin" 
                    ? "bg-olive-800 text-white rounded-br-sm" 
                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  <p>{msg.text}</p>
                  <div className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${
                    msg.sender === "admin" ? "text-olive-200" : "text-gray-400"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender === "admin" && <CheckCircle className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-olive-100 p-4 bg-white">
            <form onSubmit={handleReply} className="flex gap-4">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply to the user..."
                className="flex-1 rounded-xl border border-olive-200 bg-gray-50 px-4 py-3 text-sm focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-olive-800 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-olive-900 disabled:opacity-50"
              >
                <span>Reply</span>
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 text-charcoal-400 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-50">
             <MessageSquare className="h-8 w-8 text-olive-300" />
          </div>
          <p>Select a conversation from the sidebar to start replying</p>
        </div>
      )}
    </div>
  );
}
