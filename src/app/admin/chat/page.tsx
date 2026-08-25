"use client";

import React, { useState, useEffect, useRef } from "react";
import { database } from "@/lib/firebase";
import {
  ref,
  onValue,
  push,
  set,
  serverTimestamp,
  remove,
  update,
} from "firebase/database";
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
  Search,
  Paperclip,
  Smile,
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
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
            if (a.meta.status === "pending" && b.meta.status !== "pending") return -1;
            if (b.meta.status === "pending" && a.meta.status !== "pending") return 1;
            return (b.meta.lastMessageTime || 0) - (a.meta.lastMessageTime || 0);
          });

        setSessions(sessionList);

        // Auto-select first session if none selected
        if (!activeChatId && sessionList.length > 0 && sessionList[0]) {
          setActiveChatId(sessionList[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, [activeChatId]);

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

  // Auto-scroll messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
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
        activeMode: "human",
      });

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const announceRef = push(messagesRef);
      await set(announceRef, {
        sender: "system",
        text: `Live support session started with ${adminDisplayName}.`,
        timestamp: serverTimestamp(),
      });
      setActiveChatId(chatId);
    } catch (e) {
      console.error("Failed to accept request", e);
    }
  };

  // Decline / Dismiss a Support Request
  const handleDeclineRequest = async (chatId: string) => {
    if (!database) return;
    try {
      await update(ref(database, `chats/${chatId}/meta`), {
        status: "closed",
        unreadAdmin: false,
        activeMode: "ai",
      });

      const messagesRef = ref(database, `chats/${chatId}/messages`);
      const announceRef = push(messagesRef);
      await set(announceRef, {
        sender: "system",
        text: "Live support request was closed. AI assistant active.",
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Failed to decline request", e);
    }
  };

  // End an Active Live Session
  const handleEndSession = async (chatId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to end this live support session? Customer will return to AI.")) {
      try {
        await update(ref(database, `chats/${chatId}/meta`), {
          status: "closed",
          unreadAdmin: false,
          activeMode: "ai",
        });

        const messagesRef = ref(database, `chats/${chatId}/messages`);
        const announceRef = push(messagesRef);
        await set(announceRef, {
          sender: "system",
          text: "Live support ended. You can continue chatting with AI.",
          timestamp: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to end session", e);
      }
    }
  };

  // Open New Direct Chat
  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users?limit=30");
      const json = await res.json();
      if (json.success && json.data?.users) {
        setAvailableUsers(json.data.users);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChatWithUser = async (targetUser: any) => {
    if (!database) return;
    const targetChatId = `user_${targetUser._id}`;
    try {
      await update(ref(database, `chats/${targetChatId}/meta`), {
        userName: targetUser.name,
        userEmail: targetUser.email,
        lastMessage: "Conversation initiated by Support",
        lastMessageTime: serverTimestamp(),
        status: "active",
        agentName: currentAdmin?.name || "Support Agent",
        unreadAdmin: false,
        activeMode: "human",
      });

      const messagesRef = ref(database, `chats/${targetChatId}/messages`);
      const welcomeRef = push(messagesRef);
      await set(welcomeRef, {
        sender: "admin",
        text: `Hello ${targetUser.name}! How can our support team assist you today?`,
        agentName: currentAdmin?.name || "Support Agent",
        timestamp: serverTimestamp(),
      });

      setIsNewChatOpen(false);
      setActiveChatId(targetChatId);
    } catch (e) {
      console.error("Failed to start chat with user", e);
    }
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

    const currentText = reply.trim();
    setReply("");

    const messagesRef = ref(database, `chats/${activeChatId}/messages`);
    const newMessageRef = push(messagesRef);

    const msgData = {
      sender: "admin",
      text: currentText,
      agentName: currentAdmin?.name || "Support Agent",
      timestamp: serverTimestamp(),
    };

    await set(newMessageRef, msgData);

    await update(ref(database, `chats/${activeChatId}/meta`), {
      lastMessage: currentText,
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

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (s.meta.userName && s.meta.userName.toLowerCase().includes(query)) ||
      (s.meta.userEmail && s.meta.userEmail.toLowerCase().includes(query)) ||
      (s.meta.lastMessage && s.meta.lastMessage.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Segmented Navigation */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl flex items-center gap-1 shadow-sm border border-olive-200/80 w-full max-w-sm">
          <button
            onClick={() => setActiveMode("support")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
              activeMode === "support"
                ? "bg-olive-800 text-cream-50 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-olive-50"
            }`}
          >
            <Headphones className="h-4 w-4" />
            <span>Live Support</span>
            {pendingRequests.length > 0 ? (
              <span className="flex h-5 px-2 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white animate-pulse">
                {pendingRequests.length} Req
              </span>
            ) : unreadCount > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveMode("ai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold transition-all ${
              activeMode === "ai"
                ? "bg-olive-800 text-cream-50 shadow-sm"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-olive-50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI FAQ Insights</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeMode === "support" && (
        <div className="h-[calc(100vh-13rem)] min-h-[550px] flex overflow-hidden rounded-3xl border border-olive-200/80 bg-white shadow-sm ring-1 ring-black/5">
          {/* Left Panel: Conversations List */}
          <div className="w-[320px] lg:w-[350px] shrink-0 border-r border-olive-200/70 bg-cream-50/50 flex flex-col relative">
            {/* Conversations Header */}
            <div className="p-4 border-b border-olive-200/70 bg-white flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-olive-700" />
                  <span>Conversations</span>
                </h2>
                <p className="text-xs text-charcoal-500 font-medium">
                  {sessions.length} customer thread{sessions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={handleOpenNewChat}
                className="p-2 bg-olive-100 text-olive-800 rounded-full hover:bg-olive-200 transition-colors shadow-2xs"
                title="Start Direct Chat with Customer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-olive-100 bg-white/80">
              <div className="relative flex items-center">
                <Search className="h-3.5 w-3.5 text-charcoal-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full bg-cream-100/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-charcoal-800 placeholder:text-charcoal-400 border border-olive-200/60 focus:outline-none focus:bg-white focus:border-olive-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-charcoal-400 hover:text-charcoal-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Direct New Chat Modal */}
            {isNewChatOpen && (
              <div className="absolute inset-0 z-20 bg-white flex flex-col shadow-xl">
                <div className="p-3.5 border-b border-olive-200 flex justify-between items-center bg-cream-50">
                  <h3 className="font-bold text-charcoal-900 text-xs uppercase tracking-wider">
                    Start Direct Chat
                  </h3>
                  <button
                    onClick={() => setIsNewChatOpen(false)}
                    className="p-1 text-charcoal-500 hover:text-charcoal-900 rounded-full hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {loadingUsers ? (
                    <div className="p-6 text-center text-xs text-charcoal-400">
                      Loading customer directory...
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-charcoal-400">
                      No customers found.
                    </div>
                  ) : (
                    availableUsers.map((u) => (
                      <button
                        key={u._id}
                        onClick={() => handleStartChatWithUser(u)}
                        className="w-full text-left p-2.5 hover:bg-olive-50 rounded-xl flex items-center gap-3 transition-colors border border-transparent hover:border-olive-200"
                      >
                        <div className="h-8 w-8 bg-olive-100 rounded-full flex items-center justify-center text-olive-800 font-bold text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-charcoal-900 truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-charcoal-500 truncate">
                            {u.email}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {filteredSessions.map((session) => {
                const isActive = activeChatId === session.id;
                const isPending = session.meta.status === "pending";
                const isLive = session.meta.status === "active";

                return (
                  <div
                    key={session.id}
                    className={`w-full rounded-2xl transition-all border ${
                      isActive
                        ? "bg-olive-900 text-white border-olive-950 shadow-sm"
                        : isPending
                        ? "bg-amber-50/90 border-amber-300 shadow-2xs hover:bg-amber-100/80"
                        : "bg-white border-olive-100 hover:bg-olive-50/50 shadow-2xs"
                    }`}
                  >
                    <button
                      onClick={() => setActiveChatId(session.id)}
                      className="w-full text-left p-3 flex items-start gap-3 relative"
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0 mt-0.5">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs shadow-inner ${
                            isActive
                              ? "bg-white/20 text-white"
                              : isPending
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-olive-100 text-olive-800"
                          }`}
                        >
                          {session.meta.userName?.charAt(0).toUpperCase() || "C"}
                        </div>
                        {session.meta.unreadAdmin && !isActive && (
                          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white shadow-xs" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3
                            className={`text-xs font-bold truncate ${
                              isActive ? "text-white" : "text-charcoal-900"
                            }`}
                          >
                            {session.meta.userName || "Customer"}
                          </h3>
                          <span
                            className={`text-[10px] shrink-0 font-medium ${
                              isActive ? "text-olive-200" : "text-charcoal-400"
                            }`}
                          >
                            {session.meta.lastMessageTime
                              ? new Date(session.meta.lastMessageTime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )
                              : ""}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1 mb-1">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-200/80 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-900 uppercase">
                              <PhoneCall className="h-2.5 w-2.5" />
                              <span>Live Request</span>
                            </span>
                          )}
                          {isLive && !isActive && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 uppercase">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              <span>Live</span>
                            </span>
                          )}
                          {!isPending && !isLive && (
                            <span
                              className={`text-[9px] font-medium ${
                                isActive ? "text-olive-200" : "text-charcoal-400"
                              }`}
                            >
                              AI Mode
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-[11.5px] truncate ${
                            isActive
                              ? "text-cream-100"
                              : isPending
                              ? "text-amber-900 font-bold"
                              : session.meta.unreadAdmin
                              ? "font-bold text-charcoal-900"
                              : "text-charcoal-500"
                          }`}
                        >
                          {session.meta.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </button>

                    {/* Quick Accept/Decline action on pending session */}
                    {isPending && (
                      <div className="px-3 pb-2.5 pt-0 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(session.id)}
                          className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 flex items-center justify-center gap-1 shadow-2xs transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(session.id)}
                          className="rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:text-red-700 text-charcoal-600 text-[11px] font-semibold px-2.5 py-1.5 transition-colors"
                          title="Decline"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredSessions.length === 0 && (
                <div className="p-8 text-center flex flex-col items-center text-charcoal-400 space-y-2">
                  <MessageSquare className="h-7 w-7 opacity-30" />
                  <p className="text-xs font-medium">No conversations found.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Timeline */}
          {activeChatId ? (
            <div className="flex-1 min-w-0 flex flex-col bg-white">
              {/* Active Chat Header */}
              <div className="flex-shrink-0 flex items-center justify-between border-b border-olive-200/70 p-4 px-6 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-900 text-cream-50 font-bold text-sm shrink-0 shadow-xs">
                    {activeSession?.meta.userName?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-charcoal-900 text-sm truncate">
                        {activeSession?.meta.userName || "Customer"}
                      </h2>
                      {activeSession?.meta.status === "pending" && (
                        <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <PhoneCall className="h-3 w-3" />
                          <span>Pending Request</span>
                        </span>
                      )}
                      {activeSession?.meta.status === "active" && (
                        <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Live Session Active</span>
                        </span>
                      )}
                      {activeSession?.meta.status === "closed" && (
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          AI Mode
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-500 font-medium truncate">
                      {activeSession?.meta.userEmail || "Guest visitor"}
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {activeSession?.meta.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(activeChatId)}
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Accept Support</span>
                    </button>
                  )}

                  {activeSession?.meta.status === "active" && (
                    <button
                      type="button"
                      onClick={() => handleEndSession(activeChatId)}
                      className="rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <PhoneOff className="h-3.5 w-3.5" />
                      <span>End Live Session</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Timeline */}
              <div
                ref={messagesContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scroll-smooth"
              >
                {messages.map((msg, index) => {
                  const isAdmin = msg.sender === "admin";
                  const isAi = msg.sender === "ai";
                  const isSystem = msg.sender === "system";
                  const isUser = msg.sender === "user";

                  if (isSystem) {
                    return (
                      <div
                        key={msg.id || index}
                        className="my-3 flex items-center justify-center"
                      >
                        <div className="flex items-center gap-1.5 rounded-full bg-olive-100/90 px-4 py-1 text-[11px] font-semibold text-olive-900 border border-olive-200 shadow-2xs text-center">
                          <ShieldCheck className="h-3.5 w-3.5 text-olive-700 shrink-0" />
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    );
                  }

                  if (isAi) {
                    return (
                      <div
                        key={msg.id || index}
                        className="flex flex-col items-start my-2"
                      >
                        <div className="flex items-start gap-2.5 max-w-[85%]">
                          <div className="h-7 w-7 rounded-full bg-olive-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Sparkles className="h-3.5 w-3.5 text-olive-200" />
                          </div>
                          <div className="bg-olive-50/90 border border-olive-200 rounded-2xl rounded-tl-sm p-3.5 text-xs text-charcoal-800 space-y-1 shadow-2xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-olive-800 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              <span>AI Automated Response</span>
                            </p>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-charcoal-400 mt-1 ml-9">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${
                        isAdmin ? "items-end" : "items-start"
                      } group`}
                    >
                      <div
                        className={`flex items-end gap-2.5 max-w-[80%] ${
                          isAdmin ? "flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        {!isAdmin && (
                          <div className="h-8 w-8 shrink-0 rounded-full bg-olive-100 flex items-center justify-center font-bold text-xs text-olive-800 shadow-inner">
                            {activeSession?.meta.userName?.charAt(0).toUpperCase() || "C"}
                          </div>
                        )}

                        {/* Hover actions for admin */}
                        {isAdmin && editingMsgId !== msg.id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1">
                            <button
                              onClick={() => {
                                setEditingMsgId(msg.id);
                                setEditingText(msg.text);
                              }}
                              className="p-1 text-gray-400 hover:text-olive-700 hover:bg-olive-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMsg(msg.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {editingMsgId === msg.id ? (
                          <div className="bg-white border border-gray-200 p-2.5 rounded-2xl shadow-md w-full min-w-[260px]">
                            <form onSubmit={submitEdit} className="flex flex-col gap-2">
                              <input
                                autoFocus
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-gray-50 px-3 py-2 rounded-xl text-xs border border-gray-200 focus:outline-none focus:border-olive-400 focus:bg-white transition-all"
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
                                  className="text-[10px] font-bold text-white bg-olive-800 hover:bg-olive-900 rounded px-3 py-1 uppercase disabled:opacity-50 transition-colors shadow-2xs"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div
                            className={`text-[13.5px] leading-relaxed break-words whitespace-pre-wrap ${
                              isAdmin
                                ? "bg-olive-900 text-white rounded-[20px] rounded-br-[4px] px-4 py-2.5 shadow-sm"
                                : "bg-white border border-olive-200/80 text-charcoal-900 rounded-[20px] rounded-tl-[4px] px-4 py-2.5 shadow-2xs"
                            }`}
                          >
                            {msg.imageUrl && (
                              <img
                                src={msg.imageUrl}
                                alt="attachment"
                                className="max-w-[260px] max-h-[260px] object-cover rounded-xl mb-2"
                              />
                            )}
                            <p>{msg.text}</p>
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Meta */}
                      <div
                        className={`mt-1 text-[10px] font-medium flex items-center gap-1 ${
                          isAdmin
                            ? "mr-1 text-gray-400 justify-end"
                            : "text-gray-400 ml-10"
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.isEdited && <span className="italic opacity-70">(edited)</span>}
                        {isAdmin && <CheckCircle className="h-3 w-3 text-emerald-500 ml-0.5" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="flex-shrink-0 border-t border-olive-200/70 bg-white p-3.5 px-6 relative">
                {showEmoji && (
                  <div className="absolute bottom-[75px] left-6 shadow-2xl z-50 rounded-2xl overflow-hidden border border-black/5">
                    <EmojiPicker onEmojiClick={onEmojiClick} width={290} height={330} />
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
                  className="flex items-center bg-gray-50 border border-olive-200/80 rounded-full p-1 focus-within:ring-2 focus-within:ring-olive-500/20 focus-within:border-olive-400 focus-within:bg-white transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-charcoal-400 hover:text-olive-700 hover:bg-olive-50 rounded-full transition-colors disabled:opacity-50 ml-1"
                    title="Upload photo"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="p-2 text-charcoal-400 hover:text-olive-700 hover:bg-olive-50 rounded-full transition-colors mr-1"
                    title="Insert emoji"
                  >
                    <Smile className="h-4 w-4" />
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
                    className="flex-1 bg-transparent px-2 py-2 text-[13.5px] text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none disabled:bg-transparent"
                  />

                  <button
                    type="submit"
                    disabled={!reply.trim() || isUploading}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-800 text-white transition-all hover:bg-olive-900 active:scale-95 disabled:opacity-40 disabled:hover:bg-olive-800 shrink-0 mr-1 shadow-xs"
                    title="Send message"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/50">
              <div className="h-16 w-16 bg-olive-100 rounded-full flex items-center justify-center text-olive-700 mb-3">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-charcoal-900 text-base">Select a conversation</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mt-1">
                Choose a customer thread from the left to start responding in real time.
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI FAQ Insights Tab View */}
      {activeMode === "ai" && <AIFaqView />}
    </div>
  );
}
