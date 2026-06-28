import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, MessageSquare, Paperclip, Plus, Search, Send, Users, X } from "lucide-react";
import { API_BASE_URL, apiRequest } from "../services/platformApi";
import type { AuthUser } from "../services/platformApi";
import type { Message } from "../data/mockData";

type ChatRole = "candidate" | "recruiter";

type ChatUser = {
  id: string;
  profileId?: string;
  name: string;
  email: string;
  role: ChatRole;
  avatar?: string;
  subtitle?: string;
  resumeUrl?: string;
  online?: boolean;
  lastSeen?: string | null;
};

function formatLastSeen(value?: string | null) {
  if (!value) return "Last seen unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Last seen unavailable";
  return `Last seen ${date.toLocaleString()}`;
}

export function MessagingPanel({ currentUser, allowedRoles = ["candidate", "recruiter"] }: { currentUser: AuthUser | null; allowedRoles?: ChatRole[] }) {
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [role, setRole] = useState<ChatRole>(allowedRoles[0] || "candidate");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentId = currentUser?.id || "";
  const visibleMessages = useMemo(() => messages.filter((msg) => selectedUser && ((msg.senderId === currentId && msg.recipientId === selectedUser.id) || (msg.senderId === selectedUser.id && msg.recipientId === currentId))), [currentId, messages, selectedUser]);

  useEffect(() => {
    const token = localStorage.getItem("skillora_token");
    if (!token) return;
    const stream = new EventSource(`${API_BASE_URL}/messages/stream?token=${encodeURIComponent(token)}`);
    stream.addEventListener("message", (event) => {
      const message = JSON.parse((event as MessageEvent).data) as Message;
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      if (message.senderId !== selectedUser?.id && message.senderId !== currentId) {
        setUnread((counts) => ({ ...counts, [message.senderId]: (counts[message.senderId] || 0) + 1 }));
      }
    });
    stream.onerror = () => stream.close();
    return () => stream.close();
  }, [currentId, selectedUser?.id]);

  useEffect(() => {
    if (!launcherOpen) return;
    const handle = window.setInterval(() => {
      apiRequest<{ counts: Record<string, number> }>("/messages/unread").then((result) => setUnread(result.counts)).catch(() => undefined);
    }, 10000);
    apiRequest<{ counts: Record<string, number> }>("/messages/unread").then((result) => setUnread(result.counts)).catch(() => undefined);
    return () => window.clearInterval(handle);
  }, [launcherOpen]);

  useEffect(() => {
    if (!launcherOpen) return;
    let cancelled = false;
    apiRequest<{ users: ChatUser[] }>(`/messages/users?role=${role}&search=${encodeURIComponent(search)}`)
      .then((result) => {
        if (!cancelled) setUsers(result.users.filter((user) => user.id !== currentId));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load users");
      });
    return () => {
      cancelled = true;
    };
  }, [currentId, launcherOpen, role, search]);

  useEffect(() => {
    if (!selectedUser) return;
    apiRequest<{ messages: Message[] }>(`/messages/conversations/${selectedUser.id}`)
      .then((result) => {
        setMessages((current) => {
          const byId = new Map(current.map((item) => [item.id, item]));
          result.messages.forEach((item) => byId.set(item.id, item));
          return [...byId.values()].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        });
        setUnread((counts) => ({ ...counts, [selectedUser.id]: 0 }));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load conversation"));
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length]);

  const sendMessage = async (content: string, attachments: Message["attachments"] = [], resumeShared = false) => {
    if (!selectedUser || !content.trim()) return;
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      senderId: currentId,
      senderName: currentUser?.name || "You",
      senderRole: currentUser?.role || "user",
      recipientId: selectedUser.id,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      attachments,
      resumeShared,
    };
    setMessages((current) => [...current, optimistic]);
    setReply("");
    try {
      const result = await apiRequest<{ message: Message }>("/messages", {
        method: "POST",
        body: JSON.stringify({ recipientId: selectedUser.id, content, attachments, resumeShared }),
      });
      setMessages((current) => current.map((item) => item.id === optimistic.id ? result.message : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be sent");
    }
  };

  return (
    <div className="relative min-h-[520px]">
      {!launcherOpen && (
        <button onClick={() => setLauncherOpen(true)} className="absolute left-1/2 top-48 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105" style={{ background: "#0a0a0c", color: "#f2f0e6" }}>
          <Plus size={28} />
        </button>
      )}

      {launcherOpen && !selectedUser && (
        <div className="dashboard-card max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: "#0a0a0c" }}>Start a Conversation</h2>
            <button onClick={() => setLauncherOpen(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allowedRoles.map((item) => (
              <button key={item} onClick={() => setRole(item)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium" style={{ background: role === item ? "#0a0a0c" : "#f4f4f4", color: role === item ? "#f2f0e6" : "#0a0a0c" }}>
                <Users size={16} /> {item === "candidate" ? "Candidates" : "Recruiters"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6c6c6c" }} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user" className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
          </div>
          {error && <p className="text-sm" style={{ color: "#e74c3c" }}>{error}</p>}
          <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            {users.map((user) => (
              <button key={user.id} onClick={() => setSelectedUser(user)} className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50" style={{ border: "1px solid #e5e5e5" }}>
                <img src={user.avatar || (user.role === "candidate" ? "/images/candidate-1.jpg" : "/images/recruiter-1.jpg")} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#0a0a0c" }}>{user.name}</p>
                  <p className="text-xs truncate" style={{ color: "#6c6c6c" }}>{user.subtitle}</p>
                </div>
                <span className="text-xs" style={{ color: user.online ? "#3dc75a" : "#6c6c6c" }}>{user.online ? "Online" : "Offline"}</span>
                {!!unread[user.id] && <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#e74c3c", color: "white" }}>{unread[user.id]}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="dashboard-card max-w-4xl mx-auto flex flex-col" style={{ minHeight: 520 }}>
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid #e5e5e5" }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              <img src={selectedUser.avatar || "/images/candidate-1.jpg"} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#0a0a0c" }}>{selectedUser.name}</p>
                <p className="text-xs" style={{ color: selectedUser.online ? "#3dc75a" : "#6c6c6c" }}>{selectedUser.online ? "Online" : formatLastSeen(selectedUser.lastSeen)}</p>
              </div>
            </div>
            <MessageSquare size={18} style={{ color: "#6c6c6c" }} />
          </div>
          <div className="flex-1 space-y-4 py-4 overflow-y-auto custom-scrollbar max-h-[360px]">
            {visibleMessages.map((msg) => {
              const mine = msg.senderId === currentId;
              return (
                <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-xl" style={{ background: mine ? "#0071e3" : "#f4f4f4", color: mine ? "white" : "#0a0a0c" }}>
                    <p className="text-xs font-medium mb-1 opacity-70">{mine ? "You" : msg.senderName}</p>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachments?.map((file) => (
                      <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 text-xs underline">
                        <Paperclip size={12} /> {file.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(event) => { event.preventDefault(); sendMessage(reply); }} className="flex items-center gap-2 pt-4" style={{ borderTop: "1px solid #e5e5e5" }}>
            <input ref={fileRef} type="file" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              sendMessage(`Shared a file: ${file.name}`, [{ name: file.name, url: URL.createObjectURL(file), type: file.type, size: file.size }]);
              event.target.value = "";
            }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="p-3 rounded-lg" style={{ background: "#f4f4f4", color: "#0a0a0c" }}><Paperclip size={16} /></button>
            {selectedUser.resumeUrl && <button type="button" onClick={() => sendMessage("Shared resume", [{ name: "Resume", url: selectedUser.resumeUrl || "", type: "resume" }], true)} className="p-3 rounded-lg" style={{ background: "#f4f4f4", color: "#0a0a0c" }}><FileText size={16} /></button>}
            <input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Type your message..." className="flex-1 px-4 py-3 rounded-lg text-sm outline-none" style={{ background: "#f4f4f4", border: "1px solid #e5e5e5" }} />
            <button type="submit" className="p-3 rounded-lg" style={{ background: "#0a0a0c", color: "#f2f0e6" }}><Send size={16} /></button>
          </form>
        </div>
      )}
    </div>
  );
}

