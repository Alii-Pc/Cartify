"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Headphones,
  Paperclip,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { useAuth } from "@/context/AuthContext";

type MessageSender = "user" | "ai" | "admin" | "system";

type Message = {
  id: string;
  sender: MessageSender;
  text: string;
  imageUrl?: string;
  timestamp: number;
  suggestLiveSupport?: boolean;
  isEdited?: boolean;
  agentName?: string;
};

type ChatMode = "ai" | "connecting" | "live";

export function AIChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("ai");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [agentName, setAgentName] = useState<string>("Support Agent");

  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectingElapsed, setConnectingElapsed] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const connectingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or retrieve Chat ID
  useEffect(() => {
    let currentId = localStorage.getItem("cartify_chat_id");
    if (!currentId) {
      currentId = `anon_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem("cartify_chat_id", currentId);
    }
    if (user && (user.id || (user as any)._id)) {
      currentId = `user_${user.id || (user as any)._id}`;
    }
    setChatId(currentId);
  }, [user]);

  // Load chat history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cartify_ai_chat");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
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

  // Scroll to bottom helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Scroll to bottom on new message or typing
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      const timer = setTimeout(() => scrollToBottom("auto"), 120);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isTyping, mode]);

  // Firebase Realtime Database Listener for Live Support Sessions
  useEffect(() => {
    if (!chatId || !database) return;

    const chatMetaRef = ref(database, `chats/${chatId}/meta`);
    const chatMsgsRef = ref(database, `chats/${chatId}/messages`);

    // Listen to chat metadata changes (status transitions: pending -> active -> closed)
    const unsubMeta = onValue(chatMetaRef, (snapshot) => {
      if (snapshot.exists()) {
        const meta = snapshot.val();
        if (meta.status === "active") {
          setMode("live");
          if (meta.agentName) {
            setAgentName(meta.agentName);
          }
        } else if (meta.status === "pending") {
          setMode("connecting");
        } else if (meta.status === "closed" && mode === "live") {
          setMode("ai");
        }
      }
    });

    // Listen to new live messages from admin
    const unsubMsgs = onValue(chatMsgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const liveList: Message[] = Object.keys(data)
          .map((key) => ({
            id: key,
            sender: data[key].sender,
            text: data[key].text || "",
            imageUrl: data[key].imageUrl,
            timestamp: typeof data[key].timestamp === "number" ? data[key].timestamp : Date.now(),
            isEdited: data[key].isEdited,
            agentName: data[key].agentName,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        setMessages((prev) => {
          const mergedMap = new Map<string, Message>();
          prev.forEach((m) => mergedMap.set(m.id, m));
          liveList.forEach((m) => mergedMap.set(m.id, m));
          return Array.from(mergedMap.values()).sort((a, b) => a.timestamp - b.timestamp);
        });
      }
    });

    return () => {
      unsubMeta();
      unsubMsgs();
    };
  }, [chatId, mode]);

  // Connecting timer tracker
  useEffect(() => {
    if (mode === "connecting") {
      setConnectingElapsed(0);
      connectingTimerRef.current = setInterval(() => {
        setConnectingElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (connectingTimerRef.current) {
        clearInterval(connectingTimerRef.current);
      }
    }
    return () => {
      if (connectingTimerRef.current) clearInterval(connectingTimerRef.current);
    };
  }, [mode]);

  // Listen for external open events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-live-chat", handleOpen);
    window.addEventListener("open-ai-chat", handleOpen);
    return () => {
      window.removeEventListener("open-live-chat", handleOpen);
      window.removeEventListener("open-ai-chat", handleOpen);
    };
  }, []);

  // Automatic Live Support Connection (Triggered only when human support is explicitly requested)
  const autoConnectToAdmin = async (allMessages: Message[]) => {
    if (!chatId || !database) return;

    setMode("connecting");

    try {
      const messagesRef = ref(database, `chats/${chatId}/messages`);

      // Seed prior messages so Admin has context
      for (const m of allMessages) {
        const itemRef = push(messagesRef);
        await set(itemRef, {
          sender: m.sender,
          text: m.text,
          imageUrl: m.imageUrl || null,
          timestamp: m.timestamp,
        });
      }

      const handoffMsgRef = push(messagesRef);
      await set(handoffMsgRef, {
        sender: "system",
        text: "Customer requested live support.",
        timestamp: serverTimestamp(),
      });

      await set(ref(database, `chats/${chatId}/meta`), {
        userName: user ? user.name : "Customer",
        userEmail: user ? user.email : "Not provided",
        lastMessage: "Requested Live Support",
        lastMessageTime: serverTimestamp(),
        unreadAdmin: true,
        status: "pending",
        requestedAt: serverTimestamp(),
        activeMode: "human",
      });
    } catch (err) {
      console.error("Failed to connect to live support:", err);
    }
  };

  // Cancel Live Support Request and return to AI
  const handleCancelLiveSupport = async () => {
    setMode("ai");
    if (chatId && database) {
      try {
        await set(ref(database, `chats/${chatId}/meta/status`), "closed");
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const cancelMsgRef = push(messagesRef);
        await set(cancelMsgRef, {
          sender: "system",
          text: "Live support cancelled by customer. Returned to AI Assistant.",
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to cancel live support session:", e);
      }
    }

    const cancelMsg: Message = {
      id: `sys_${Date.now()}`,
      sender: "system",
      text: "You are back in AI Shopping Assistant mode.",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  };

  // Send message handler
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const currentText = textToSend.trim();
    setMessage("");
    setError(null);

    // 1. LIVE SUPPORT MODE
    if (mode === "live" || mode === "connecting") {
      if (!chatId || !database) return;

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const newMessageRef = push(messagesRef);

      const msgData = {
        sender: "user",
        text: currentText,
        timestamp: serverTimestamp(),
      };

      await set(newMessageRef, msgData);

      await set(ref(database, `chats/${chatId}/meta/lastMessage`), currentText);
      await set(ref(database, `chats/${chatId}/meta/lastMessageTime`), serverTimestamp());
      await set(ref(database, `chats/${chatId}/meta/unreadAdmin`), true);
      return;
    }

    // 2. AI SHOPPING ASSISTANT MODE
    if (isTyping) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: currentText,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const history = newMessages
        .filter((m) => m.sender === "user" || m.sender === "ai")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiMsg: Message = {
          id: `ai_${Date.now() + 1}`,
          sender: "ai",
          text: data.text,
          timestamp: Date.now(),
        };
        const updatedList = [...newMessages, aiMsg];
        setMessages(updatedList);

        // Connect only if user explicitly asked for live support
        if (data.suggestLiveSupport) {
          autoConnectToAdmin(updatedList);
        }
      } else {
        setError(data.error || "Failed to get a response from AI.");
      }
    } catch (err) {
      setError("An error occurred while connecting to the AI.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  // Image Upload handler for Live Support mode
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chatId || !database) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5MB)");
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

        await set(ref(database, `chats/${chatId}/meta/lastMessage`), "Sent an image");
        await set(ref(database, `chats/${chatId}/meta/lastMessageTime`), serverTimestamp());
        await set(ref(database, `chats/${chatId}/meta/unreadAdmin`), true);
      } else {
        setError(data.message || "Failed to upload image");
      }
    } catch (err) {
      setError("Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <div className="mb-4 flex h-[620px] max-h-[85vh] w-[390px] max-w-[92vw] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/10 animate-slideUp transition-all origin-bottom-right">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-4 px-5 border-b border-black/[0.06] bg-white">
            <div className="flex items-center gap-3">
              {mode === "live" ? (
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-cream-50 shadow-sm">
                  <Headphones className="h-5 w-5 text-olive-300" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
              ) : (
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-olive-800 text-cream-50 shadow-sm">
                  <Sparkles className="h-5 w-5 text-cream-50" />
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm text-charcoal-900 tracking-tight leading-none mb-1">
                  {mode === "live"
                    ? `Live Support • ${agentName}`
                    : mode === "connecting"
                    ? "Connecting to Support..."
                    : "Shopping Assistant"}
                </h3>
                <p className="text-[11px] font-medium text-olive-700 flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      mode === "connecting"
                        ? "bg-amber-500 animate-ping"
                        : "bg-emerald-500 animate-pulse"
                    }`}
                  ></span>
                  {mode === "live"
                    ? "Human Agent Connected"
                    : mode === "connecting"
                    ? `Connecting with agent (${connectingElapsed}s)`
                    : "AI Online"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(mode === "live" || mode === "connecting") && (
                <button
                  type="button"
                  onClick={handleCancelLiveSupport}
                  className="text-[11px] font-bold text-olive-800 bg-olive-50 hover:bg-olive-100 px-3 py-1 rounded-full border border-olive-200 transition-colors"
                  title="Return to AI Assistant"
                >
                  Return to AI
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-charcoal-500 hover:text-charcoal-900 transition-all focus:outline-none"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50/60 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center space-y-4 px-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm border border-olive-100 rotate-3">
                  <MessageSquare className="h-8 w-8 text-olive-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-charcoal-900">
                    Welcome to Cartify!
                  </h4>
                  <p className="text-xs text-charcoal-500 leading-relaxed max-w-[240px] mx-auto">
                    I&apos;m your AI Shopping Assistant. Ask me about products, order tracking (/track), returns, or anything else!
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center pt-2">
                  <button
                    onClick={() => handleSendMessage("What are your bestsellers?")}
                    className="text-[11px] font-medium bg-white border border-gray-200 text-charcoal-700 px-3 py-1.5 rounded-full hover:border-olive-300 hover:bg-olive-50 transition-colors shadow-2xs"
                  >
                    🔥 Bestsellers
                  </button>
                  <button
                    onClick={() => handleSendMessage("How do I track my order?")}
                    className="text-[11px] font-medium bg-white border border-gray-200 text-charcoal-700 px-3 py-1.5 rounded-full hover:border-olive-300 hover:bg-olive-50 transition-colors shadow-2xs"
                  >
                    📦 Track Order
                  </button>
                  <button
                    onClick={() => handleSendMessage("I want to talk to live support")}
                    className="text-[11px] font-medium bg-white border border-gray-200 text-charcoal-700 px-3 py-1.5 rounded-full hover:border-olive-300 hover:bg-olive-50 transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Headphones className="h-3 w-3 text-olive-700" />
                    <span>Talk to Human</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  const isSystem = msg.sender === "system";
                  const isAdmin = msg.sender === "admin";

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id || index}
                        className="my-3 flex items-center justify-center"
                      >
                        <div className="flex items-center gap-1.5 rounded-full bg-olive-100/90 px-3.5 py-1 text-[11px] font-semibold text-olive-900 border border-olive-200 shadow-2xs text-center max-w-[90%]">
                          <ShieldCheck className="h-3.5 w-3.5 text-olive-700 shrink-0" />
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    );
                  }

                  const showAvatar =
                    !isUser &&
                    (index === 0 ||
                      messages[index - 1]?.sender === "user" ||
                      messages[index - 1]?.sender === "system");

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {!isUser && (
                          <div
                            className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center shadow-xs text-white ${
                              isAdmin
                                ? "bg-charcoal-900 font-bold text-[10px]"
                                : "bg-olive-800"
                            } ${showAvatar ? "opacity-100" : "opacity-0"}`}
                          >
                            {isAdmin ? "CS" : <Sparkles className="h-3.5 w-3.5 text-olive-200" />}
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <div
                            className={`text-[13.5px] leading-relaxed break-words whitespace-pre-wrap ${
                              isUser
                                ? "bg-charcoal-900 text-white rounded-[20px] rounded-br-[4px] px-4 py-2.5 shadow-xs"
                                : isAdmin
                                ? "bg-white border border-olive-200 text-charcoal-900 rounded-[20px] rounded-tl-[4px] px-4 py-2.5 shadow-2xs ring-1 ring-olive-700/10"
                                : "bg-white border border-gray-100 text-charcoal-900 rounded-[20px] rounded-tl-[4px] px-4 py-2.5 shadow-2xs"
                            }`}
                          >
                            {isAdmin && (
                              <p className="text-[10px] font-bold uppercase tracking-wider text-olive-800 mb-1 flex items-center gap-1">
                                <Headphones className="h-3 w-3" />
                                <span>{msg.agentName || "Support Agent"}</span>
                              </p>
                            )}

                            {msg.imageUrl && (
                              <div className="my-1.5 rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-[220px]">
                                <img
                                  src={msg.imageUrl}
                                  alt="attachment"
                                  className="w-full h-auto object-cover max-h-[180px]"
                                />
                              </div>
                            )}

                            {msg.text &&
                              msg.text.split(/(!\[.*?\]\(.*?\))/g).map((part, i) => {
                                const match = part.match(/!\[(.*?)\]\((.*?)\)/);
                                if (match) {
                                  return (
                                    <div
                                      key={i}
                                      className="my-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                                    >
                                      <img
                                        src={match[2]}
                                        alt={match[1]}
                                        className="w-full h-auto object-cover aspect-video bg-gray-50"
                                      />
                                    </div>
                                  );
                                }
                                return <span key={i}>{part}</span>;
                              })}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-[10px] text-gray-400 mt-1 font-medium ${
                          isUser ? "mr-2" : "ml-9"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* AI Typing Indicator */}
                {isTyping && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-end gap-2 max-w-[85%]">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-olive-800 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="h-3.5 w-3.5 text-olive-200" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-[20px] rounded-tl-[4px] px-4 py-3 shadow-xs flex items-center gap-1.5 h-[38px]">
                        <span className="w-1.5 h-1.5 bg-olive-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-olive-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-olive-500 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-center mt-2">
                    <div className="text-center text-[11px] font-medium text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-100 shadow-2xs">
                      {error}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Input Area */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 p-3 relative">
            {showEmoji && (
              <div className="absolute bottom-[70px] left-3 shadow-2xl z-50 rounded-2xl overflow-hidden border border-black/5">
                <EmojiPicker onEmojiClick={onEmojiClick} width={280} height={320} />
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <form
              onSubmit={handleSend}
              className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 focus-within:ring-2 focus-within:ring-olive-500/20 focus-within:border-olive-300 focus-within:bg-white transition-all"
            >
              {mode === "live" && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-olive-700 hover:bg-olive-50 transition-colors ml-1 disabled:opacity-50"
                  title="Upload image"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-olive-600 hover:bg-olive-50 transition-colors ml-1"
                aria-label="Emoji picker"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" x2="9.01" y1="9" y2="9" />
                  <line x1="15" x2="15.01" y1="9" y2="9" />
                </svg>
              </button>

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  mode === "live"
                    ? isUploading
                      ? "Uploading image..."
                      : "Message support agent..."
                    : mode === "connecting"
                    ? "Leave a message for agent..."
                    : "Ask anything or say 'Talk to support'..."
                }
                disabled={isTyping || isUploading}
                className="flex-1 bg-transparent px-3 py-1.5 text-[13px] text-charcoal-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!message.trim() || isTyping || isUploading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-olive-800 text-white transition-all hover:bg-olive-900 active:scale-95 disabled:opacity-40 shrink-0 mr-1"
                aria-label="Send message"
              >
                <Send className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </form>

            <div className="mt-1.5 text-center flex items-center justify-center gap-1.5">
              <span className="text-[10px] text-gray-400">
                {mode === "live"
                  ? "Live Support Active"
                  : mode === "connecting"
                  ? "Waiting for agent..."
                  : "Cartify AI Shopping Assistant"}
              </span>
              {mode === "ai" && (
                <button
                  type="button"
                  onClick={() => handleSendMessage("Connect me with live support")}
                  className="text-[10px] text-olive-700 hover:text-olive-900 font-bold underline"
                >
                  &bull; Need human help?
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Cartify Assistant"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-olive-800 text-cream-50 shadow-lg shadow-olive-950/20 transition-all duration-200 hover:bg-olive-900 hover:scale-105 active:scale-95 border border-olive-700/40"
        >
          {mode === "live" ? (
            <Headphones className="h-6 w-6 text-cream-50" />
          ) : (
            <Sparkles className="h-6 w-6 text-cream-50" />
          )}

          <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
        </button>
      )}
    </div>
  );
}
