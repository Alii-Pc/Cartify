"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User as UserIcon } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: number;
};

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-olive-100 animate-slideUp">
          <div className="flex items-center justify-between bg-olive-800 p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-700">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Cartify Support</h3>
                <p className="text-xs text-olive-200">We typically reply in minutes</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-olive-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-gray-400 space-y-2">
                <MessageSquare className="h-8 w-8 opacity-20" />
                <p>Send a message to start chatting with support.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.sender === "user" 
                      ? "bg-olive-800 text-white rounded-br-sm" 
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-olive-500 focus:outline-none focus:ring-1 focus:ring-olive-500 pr-10"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="absolute right-1 top-1 bottom-1 flex items-center justify-center rounded-full bg-olive-800 w-8 h-8 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-3 w-3 -ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-olive-800 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 animate-bounce-slow"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
