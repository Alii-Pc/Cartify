"use client";

import React, { useState, useEffect, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp, remove, update } from "firebase/database";
import {
  Send,
  User as UserIcon,
  Clock,
  CheckCircle,
  MessageSquare,
  Plus,
  X,
  Edit2,
  Trash2,
  Headphones,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  PhoneOff,
  AlertCircle,
  Check,
} from "lucide-react";
import dynamic from "next/dynamic";
import { AIFaqView } from "@/components/admin/AIFaqView";
import { useAuth } from "@/context/AuthContext";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type ChatMeta = {
  lastMessage: string;
  lastMessageTime: number;
  userName: string;
  userEmail: string;
  unreadAdmin: boolean;
  status?: "pending" | "active" | "closed";
  agentName?: string;
  requestedAt?: number;
  acceptedAt?: number;
  activeMode?: "ai" | "human";
};

type ChatSession = {
  id: string;
  meta: ChatMeta;
};

type Message = {
  id: string;
  sender: "user" | "admin" | "ai" | "system";
  text: string;
  imageUrl?: string;
  timestamp: number;
  isEdited?: boolean;
  agentName?: string;
};

export default function AdminChatPage() {
  const { user: currentAdmin } = useAuth();
  const [activeMode, setActiveMode] = useState<"support" | "ai">("support");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");

  // New Chat States
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Edit Message States
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Attachments and Emojis
  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all chat metadata
  useEffect(() => {
    if (!database) return;

    const chatsRef = ref(database, "chats");
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sessionList: ChatSession[] = Object.keys(data)
          .map((key) => ({
            id: key,
            meta: data[key].meta || {},
          }))
          .filter((s) => s.meta.lastMessageTime || s.meta.status === "pending")
          .sort((a, b) => {
            // Prioritize pending requests at the very top
            if (a.meta.status === "pending" && b.meta.status !== "pending") return -1;
            if (b.meta.status === "pending" && a.meta.status !== "pending") return 1;
            return (b.meta.lastMessageTime || 0) - (a.meta.lastMessageTime || 0);
          });

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
        const msgList: Message[] = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

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

  // Accept a Live Support Request
  const handleAcceptRequest = async (chatId: string) => {
    if (!database) return;
    const adminDisplayName = currentAdmin?.name || "Support Agent";

    try {
      await update(ref(database, `chats/${chatId}/meta`), {
        status: "active",
        agentName: adminDisplayName,
        acceptedAt: serverTimestamp(),
        unreadAdmin: false,
      });

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const acceptMsgRef = push(messagesRef);
      await set(acceptMsgRef, {
        sender: "system",
        text: `You are now connected with support agent ${adminDisplayName}.`,
        timestamp: serverTimestamp(),
      });

      setActiveChatId(chatId);
    } catch (err) {
      console.error("Failed to accept support request:", err);
    }
  };

  // Reject / Decline a Live Support Request
  const handleDeclineRequest = async (chatId: string) => {
    if (!database) return;
    if (!confirm("Decline this support request and return user to AI?")) return;

    try {
      await update(ref(database, `chats/${chatId}/meta`), {
        status: "closed",
        unreadAdmin: false,
      });

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const declineMsgRef = push(messagesRef);
      await set(declineMsgRef, {
        sender: "system",
        text: "Live support is currently unavailable. You can continue chatting with AI.",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to decline request:", err);
    }
  };

  // End an Active Live Support Session
  const handleEndSession = async (chatId: string) => {
    if (!database) return;
    if (!confirm("Are you sure you want to end this live support session? The customer will return to AI chat.")) return;

    try {
      await update(ref(database, `chats/${chatId}/meta`), {
        status: "closed",
        unreadAdmin: false,
      });

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const endMsgRef = push(messagesRef);
      await set(endMsgRef, {
        sender: "system",
        text: "Live support ended. You can continue chatting with AI.",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to end live session:", err);
    }
  };

  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users?limit=100");
      const json = await res.json();
      if (res.ok && json.data?.users) {
        setAvailableUsers(json.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChatWithUser = async (user: any) => {
    const newChatId = `user_${user._id}`;
    const existing = sessions.find((s) => s.id === newChatId);
    if (!existing) {
      await set(ref(database, `chats/${newChatId}/meta`), {
        lastMessage: "Chat started by admin",
        lastMessageTime: serverTimestamp(),
        userName: user.name,
        userEmail: user.email,
        status: "active",
        agentName: currentAdmin?.name || "Support Agent",
        unreadAdmin: false,
      });
    }
    setActiveChatId(newChatId);
    setIsNewChatOpen(false);
  };

  const handleDeleteMsg = async (msgId: string) => {
    if (!activeChatId || !database) return;
    if (confirm("Delete this message?")) {
      await remove(ref(database, `chats/${activeChatId}/messages/${msgId}`));
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !database || !editingMsgId || !editingText.trim()) return;
    await update(ref(database, `chats/${activeChatId}/messages/${editingMsgId}`), {
      text: editingText.trim(),
      isEdited: true,
    });
    setEditingMsgId(null);
    setEditingText("");
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeChatId || !database) return;

    const messagesRef = ref(database, `chats/${activeChatId}/messages`);
    const newMessageRef = push(messagesRef);

    const msgData = {
      sender: "admin",
      text: reply.trim(),
      agentName: currentAdmin?.name || "Support Agent",
      timestamp: serverTimestamp(),
    };

    setReply("");
    await set(newMessageRef, msgData);

    // Update meta
    await update(ref(database, `chats/${activeChatId}/meta`), {
      lastMessage: msgData.text,
      lastMessageTime: serverTimestamp(),
      status: "active",
      agentName: currentAdmin?.name || "Support Agent",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId || !database) return;

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
        const messagesRef = ref(database, `chats/${activeChatId}/messages`);
        const newMessageRef = push(messagesRef);
        await set(newMessageRef, {
          sender: "admin",
          text: "",
          imageUrl: data.data.secure_url,
          agentName: currentAdmin?.name || "Support Agent",
          timestamp: serverTimestamp(),
        });

        await update(ref(database, `chats/${activeChatId}/meta`), {
          lastMessage: "Sent an image",
          lastMessageTime: serverTimestamp(),
          status: "active",
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
    setReply((prev) => prev + emojiObject.emoji);
    setShowEmoji(false);
  };

  const unreadCount = sessions.filter((s) => s.meta.unreadAdmin).length;
  const pendingRequests = sessions.filter((s) => s.meta.status === "pending");
  const activeSession = sessions.find((s) => s.id === activeChatId);

  return (
    <div className="space-y-6">
      {/* Segmented Control Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100/80 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm border border-gray-200/50 w-full max-w-sm">
          <button
            onClick={() => setActiveMode("support")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeMode === "support"
                ? "bg-white text-charcoal-900 shadow-sm ring-1 ring-black/5"
                : "text-charcoal-500 hover:text-charcoal-900 hover:bg-gray-200/50"
            }`}
          >
            <span>Live Support</span>
            {pendingRequests.length > 0 ? (
              <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white animate-pulse">
                {pendingRequests.length} Req
              </span>
            ) : unreadCount > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveMode("ai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeMode === "ai"
                ? "bg-white text-charcoal-900 shadow-sm ring-1 ring-black/5"
                : "text-charcoal-500 hover:text-charcoal-900 hover:bg-gray-200/50"
            }`}
          >
            <span>AI FAQ Insights</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeMode === "support" && (
        <div className="h-[calc(100vh-12rem)] flex overflow-hidden rounded-3xl border border-olive-100 bg-white/50 backdrop-blur-xl shadow-sm ring-1 ring-black/5">
          {/* Sidebar - Chat List */}
          <div className="w-1/3 min-w-[280px] max-w-[360px] border-r border-olive-100/60 bg-white/60 flex flex-col backdrop-blur-md relative">
            <div className="p-5 border-b border-olive-100/60 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
              <div>
                <h2 className="font-display text-lg font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-olive-700" />
                  <span>Conversations</span>
                </h2>
                <p className="text-xs font-medium text-charcoal-500 mt-0.5">
                  {sessions.length} customer thread{sessions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleOpenNewChat}
                className="p-2 bg-olive-100 text-olive-800 rounded-full hover:bg-olive-200 transition-colors shadow-2xs"
                title="Start Direct Chat with User"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* New Chat Modal over sidebar */}
            {isNewChatOpen && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-charcoal-900 text-sm">Start Direct Chat</h3>
                  <button
                    onClick={() => setIsNewChatOpen(false)}
                    className="p-1 text-gray-500 hover:text-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {loadingUsers ? (
                    <div className="p-4 text-center text-sm text-gray-400">Loading users...</div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">No users found.</div>
                  ) : (
                    availableUsers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleStartChatWithUser(u)}
                        className="w-full text-left p-3 hover:bg-olive-50 rounded-lg flex items-center gap-3 transition-colors"
                      >
                        <div className="h-8 w-8 bg-olive-100 rounded-full flex items-center justify-center text-olive-700 shrink-0">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-sm text-charcoal-900 truncate">{u.name}</p>
                          <p className="text-xs text-charcoal-500 truncate">{u.email}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessions.map((session) => {
                const isActive = activeChatId === session.id;
                const isPending = session.meta.status === "pending";

                return (
                  <div
                    key={session.id}
                    className={`w-full rounded-2xl transition-all relative overflow-hidden border ${
                      isPending
                        ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30"
                        : isActive
                        ? "bg-olive-800 text-white shadow-md ring-1 ring-olive-900/10"
                        : "bg-white hover:bg-gray-50 border-gray-100 shadow-2xs hover:shadow-xs hover:border-olive-200"
                    }`}
                  >
                    <button
                      onClick={() => setActiveChatId(session.id)}
                      className="w-full text-left p-3.5 flex items-start gap-3 relative"
                    >
                      <div className="relative mt-0.5 flex-shrink-0">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-inner ${
                            isPending
                              ? "bg-amber-500 text-white animate-pulse"
                              : isActive
                              ? "bg-white/20"
                              : "bg-olive-100 text-olive-700"
                          }`}
                        >
                          {isPending ? (
                            <PhoneCall className="h-4 w-4" />
                          ) : (
                            <UserIcon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                          )}
                        </div>
                        {session.meta.unreadAdmin && !isActive && (
                          <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 z-10">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isActive ? "text-white" : "text-charcoal-900"
                            }`}
                          >
                            {session.meta.userName || "Customer"}
                          </h3>
                          <span
                            className={`text-[10px] shrink-0 font-medium ${
                              isActive ? "text-olive-100" : "text-charcoal-400"
                            }`}
                          >
                            {session.meta.lastMessageTime
                              ? new Date(session.meta.lastMessageTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </span>
                        </div>

                        <p
                          className={`text-xs truncate ${
                            isActive
                              ? "text-olive-50"
                              : isPending
                              ? "text-amber-900 font-bold"
                              : session.meta.unreadAdmin
                              ? "font-bold text-charcoal-900"
                              : "text-charcoal-500"
                          }`}
                        >
                          {isPending ? "⚠️ Live Support Requested" : session.meta.lastMessage}
                        </p>
                      </div>
                    </button>

                    {/* Quick Accept/Decline action on pending item */}
                    {isPending && (
                      <div className="px-3 pb-3 pt-0 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(session.id)}
                          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 flex items-center justify-center gap-1 shadow-2xs transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(session.id)}
                          className="rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:text-red-700 text-charcoal-600 text-[11px] font-semibold px-2.5 py-1.5 transition-colors"
                          title="Decline Request"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {sessions.length === 0 && (
                <div className="p-8 text-center flex flex-col items-center text-charcoal-400 space-y-3">
                  <MessageSquare className="h-8 w-8 opacity-20" />
                  <p className="text-sm font-medium">No customer chats right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          {activeChatId ? (
            <div className="flex-1 flex flex-col bg-white relative">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-4 px-6 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal-900 text-white font-bold text-sm">
                      {activeSession?.meta.userName?.charAt(0).toUpperCase() || "C"}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-charcoal-900 text-base">
                        {activeSession?.meta.userName || "Customer"}
                      </h2>
                      {activeSession?.meta.status === "pending" && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Pending Request
                        </span>
                      )}
                      {activeSession?.meta.status === "active" && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Live Active
                        </span>
                      )}
                      {activeSession?.meta.status === "closed" && (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          AI Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-charcoal-500">
                      {activeSession?.meta.userEmail || "No email provided"}
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  {activeSession?.meta.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(activeChatId)}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <PhoneCall className="h-4 w-4" />
                      <span>Accept Support Request</span>
                    </button>
                  )}

                  {activeSession?.meta.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleEndSession(activeChatId)}
                      className="rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <PhoneOff className="h-4 w-4" />
                      <span>End Live Session</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="flex-1 overflow-y-auto p-6 pb-28 space-y-5 bg-gray-50/40 relative">
                {messages.map((msg, index) => {
                  const isAdmin = msg.sender === "admin";
                  const isAi = msg.sender === "ai";
                  const isSystem = msg.sender === "system";
                  const isUser = msg.sender === "user";

                  // Render System Announcements
                  if (isSystem) {
                    return (
                      <div key={msg.id || index} className="my-3 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 rounded-full bg-olive-100/90 px-4 py-1 text-[11px] font-semibold text-olive-900 border border-olive-200 shadow-2xs">
                          <ShieldCheck className="h-3.5 w-3.5 text-olive-700" />
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    );
                  }

                  // Render AI Assistant Message History for Admin context
                  if (isAi) {
                    return (
                      <div key={msg.id || index} className="flex flex-col items-start">
                        <div className="flex items-start gap-2.5 max-w-[80%]">
                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-olive-700 to-charcoal-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Sparkles className="h-3.5 w-3.5 text-olive-200" />
                          </div>
                          <div className="bg-olive-50/90 border border-olive-200/80 rounded-2xl rounded-tl-sm p-3.5 text-xs text-charcoal-800 space-y-1 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-olive-800 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>AI Assistant (Automated Response)</span>
                            </p>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 ml-9">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  }

                  const showAvatar = !isAdmin && (index === 0 || messages[index - 1]?.sender === "admin");

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} group`}
                    >
                      <div className="flex items-end gap-2.5 max-w-[75%]">
                        {!isAdmin && (
                          <div
                            className={`h-8 w-8 shrink-0 rounded-full bg-olive-100 flex items-center justify-center shadow-inner ${
                              showAvatar ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            <UserIcon className="h-4 w-4 text-olive-700" />
                          </div>
                        )}

                        {/* Hover actions for admin */}
                        {isAdmin && editingMsgId !== msg.id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-2 px-1">
                            <button
                              onClick={() => {
                                setEditingMsgId(msg.id);
                                setEditingText(msg.text);
                              }}
                              className="p-1.5 text-gray-400 hover:text-olive-700 hover:bg-olive-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMsg(msg.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {editingMsgId === msg.id ? (
                          <div className="bg-white border border-gray-200 p-2 rounded-2xl shadow-md w-full min-w-[250px]">
                            <form onSubmit={submitEdit} className="flex flex-col gap-2">
                              <input
                                autoFocus
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-gray-50/50 px-3 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingMsgId(null)}
                                  className="text-[10px] font-bold text-gray-500 hover:text-gray-800 uppercase px-2 py-1 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={!editingText.trim()}
                                  className="text-[10px] font-bold text-white bg-charcoal-900 hover:bg-black rounded px-3 py-1 uppercase disabled:opacity-50 transition-colors shadow-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div
                            className={`text-[13.5px] leading-relaxed ${
                              isAdmin
                                ? "bg-charcoal-900 text-white rounded-[20px] rounded-br-[4px] px-4.5 py-3 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
                                : "bg-white border border-gray-200 text-charcoal-900 rounded-[20px] rounded-tl-[4px] px-4.5 py-3 shadow-2xs"
                            }`}
                          >
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="attachment"
                                className="max-w-[280px] max-h-[280px] object-cover rounded-xl mb-2"
                              />
                            )}
                            <p>{msg.text}</p>
                          </div>
                        )}
                      </div>
                      <div
                        className={`mt-1 text-[10px] font-medium flex items-center gap-1 ${
                          isAdmin ? "mr-1 text-gray-400 justify-end" : "text-gray-400 ml-10"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.isEdited && <span className="italic opacity-70">(edited)</span>}
                        {isAdmin && <CheckCircle className="h-3 w-3 text-emerald-500 ml-1" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Floating Input Area */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-5 px-6 z-20">
                {showEmoji && (
                  <div className="absolute bottom-[75px] left-10 shadow-2xl z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={340} />
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
                  onSubmit={handleReply}
                  className="relative flex items-center bg-white border border-gray-200 rounded-[28px] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] mx-auto max-w-4xl"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="pl-3 pr-2 text-gray-400 hover:text-charcoal-600 transition-colors disabled:opacity-50"
                    title="Upload photo"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="pr-3 text-gray-400 hover:text-charcoal-600 transition-colors"
                  >
                    <svg
                      width="20"
                      height="20"
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
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={
                      isUploading
                        ? "Uploading image..."
                        : "Type your reply to the customer in real time..."
                    }
                    disabled={isUploading}
                    className="flex-1 bg-transparent px-2 py-2 text-[14px] text-charcoal-900 placeholder:text-gray-400 focus:outline-none disabled:bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-900 text-white transition-transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:bg-gray-300 shrink-0 shadow-sm"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 7-7 7 7" />
                      <path d="M12 19V5" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 text-charcoal-400 space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
                <MessageSquare className="h-10 w-10 text-olive-200" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-charcoal-700">No Chat Selected</p>
                <p className="text-sm mt-1">Select a customer thread from the sidebar to chat</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMode === "ai" && <AIFaqView />}
    </div>
  );
}
