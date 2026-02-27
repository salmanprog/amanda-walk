"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import Button from "@/components/ui/button/Button";
import AvatarText from "@/components/ui/avatar/AvatarText";
import useApi from "@/utils/useApi";
import { useCurrentUser } from "@/utils/currentUser";

interface ChatUser {
  id: number;
  name: string;
}

interface ChatMessage {
  id: number;
  bookingId: number;
  senderId: number;
  receiverId: number | null;
  sender: ChatUser;
  receiver: ChatUser | null;
  message: string;
  createdAt: string;
}

interface ChatData {
  currentUserId: number;
  messages: ChatMessage[];
}

function AdminChatPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") ?? "";
  const bookingIdNum = bookingId ? Number(bookingId) : NaN;
  const isValidBooking = Number.isInteger(bookingIdNum) && bookingIdNum > 0;
  const { user, loadingUser } = useCurrentUser();
  const isViewOnly = (user as { role?: { id: number } } | undefined)?.role?.id === 2;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const lastMessageCountRef = useRef(0);
  const lastLastIdRef = useRef<number | null>(null);
  const { data: bookingData, fetchApi: fetchBooking } = useApi({
    url: isValidBooking ? `/api/users/booking/${bookingIdNum}` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const {
    data: chatData,
    fetchApi: fetchMessages,
    loading: loadingChat,
    error: chatError,
  } = useApi({
    url: isValidBooking ? `/api/admin/chat?bookingId=${bookingIdNum}` : "",
    method: "GET",
    type: "manual",
    requiresAuth: true,
  });

  const { sendData: postMessage, loading: sending } = useApi({
    url: "/api/admin/chat",
    method: "POST",
    type: "manual",
    requiresAuth: true,
  });

  // Use API data directly so messages show as soon as chatData arrives (don't wait for effect)
  const innerChat = chatData && typeof chatData === "object"
    ? ((chatData as { data?: ChatData }).data ?? (chatData as ChatData))
    : null;
  const apiMessages: ChatMessage[] = Array.isArray(innerChat?.messages) ? innerChat.messages : [];
  const apiCurrentUserId = innerChat?.currentUserId ?? 0;
  const displayMessages = messages.length > 0 ? messages : apiMessages;
  const displayUserId = currentUserId || apiCurrentUserId;

  // Sync API into state only when data actually changed (avoids jerk from polling)
  useEffect(() => {
    if (!chatData) return;
    const data = (chatData as { data?: ChatData }).data ?? (chatData as ChatData);
    const list = Array.isArray(data.messages) ? data.messages : [];
    const lastId = list.length > 0 ? (list[list.length - 1] as ChatMessage).id : null;
    const changed = list.length !== lastMessageCountRef.current || lastId !== lastLastIdRef.current;
    lastMessageCountRef.current = list.length;
    lastLastIdRef.current = lastId;
    setCurrentUserId(data.currentUserId ?? 0);
    if (changed) setMessages(list);
    if (chatData && !hasLoadedOnce) setHasLoadedOnce(true);
  }, [chatData, hasLoadedOnce]);

  // Load booking and messages when bookingId is valid
  useEffect(() => {
    setHasLoadedOnce(false);
    if (isValidBooking) {
      fetchBooking();
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when booking changes
  }, [isValidBooking, bookingIdNum]);

  // Poll for new messages so replies appear without refresh (every 3s while chat is open)
  const fetchMessagesRef = useRef(fetchMessages);
  fetchMessagesRef.current = fetchMessages;
  useEffect(() => {
    if (!isValidBooking) return;
    const intervalId = setInterval(() => {
      fetchMessagesRef.current();
    }, 3000);
    return () => clearInterval(intervalId);
  }, [isValidBooking, bookingIdNum]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !isValidBooking || sending) return;
    setInputMessage("");
    try {
      const res = await postMessage({ bookingId: bookingIdNum, message: text });
      if (res?.code === 200 && res?.data) {
        setMessages((prev) => [...prev, res.data as ChatMessage]);
      }
    } catch {
      setInputMessage(text);
    }
  };

  const userName = (bookingData as { userName?: string })?.userName ?? "Customer";
  const bookingLabel = isValidBooking ? `Booking #${bookingIdNum}` : "Chat";

  if (!bookingId) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/30">
        <p className="text-gray-500 dark:text-gray-400">No booking selected. Open chat from an employee booking edit page.</p>
        <Link href="/admin/employee-bookings">
          <Button type="button" variant="secondary" className="mt-4 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Employee Bookings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/30">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <Link
          href={`/admin/employee-bookings/edit/${bookingIdNum}`}
          className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          aria-label="Back to booking"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {bookingLabel} — {userName}
          </h1>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            One-to-one chat for this booking
          </p>
        </div>
      </div>

      {/* Messages - chat thread centered in the div */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center" style={{ backgroundColor: '#45589d' }}>
        {chatError ? (
          <p className="text-center text-sm text-red-600 dark:text-red-400">{chatError}</p>
        ) : loadingChat && !hasLoadedOnce ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading messages…</p>
        ) : sending && displayMessages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Sending…</p>
        ) : displayMessages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation.</p>
        ) : (
          <ul className="space-y-4 w-full max-w-2xl mx-auto">
            {displayMessages.map((m, idx) => {
              const isMe = m.senderId === displayUserId;
              const senderName = (m.sender && typeof m.sender === "object" ? (m.sender as ChatUser).name : null) ?? "—";
              const receiverName = (m.receiver && typeof m.receiver === "object" ? (m.receiver as ChatUser).name : null) ?? "—";
              const displayName = isMe ? "You" : senderName;
              const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

              return (
                <li
                  key={m.id ?? `msg-${idx}`}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} items-end max-w-[90%] ${isMe ? "ml-auto" : "mr-auto"}`}
                >
                  <AvatarText
                    name={isMe ? "You" : senderName}
                    className={`shrink-0 h-9 w-9 text-xs ${isMe ? "order-2" : "order-1"}`}
                  />
                  <div className={`flex flex-col gap-0.5 min-w-0 ${isMe ? "items-end order-1" : "items-start order-2"}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[120px]" title={displayName}>
                        {displayName}
                      </span>
                      {timeStr && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">{timeStr}</span>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2.5 shadow-sm max-w-full ${
                        isMe
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{String(m.message ?? "")}</p>
                    </div>
                  </div>
                </li>
              );
            })}
            {sending && (
              <li className="flex gap-2 flex-row-reverse items-end max-w-[90%] ml-auto">
                <AvatarText name="You" className="shrink-0 h-9 w-9 text-xs" />
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">You</span>
                  <span className="rounded-2xl rounded-br-md bg-gray-200 px-4 py-2.5 text-sm text-gray-500 dark:bg-gray-600 dark:text-gray-300">
                    Sending…
                  </span>
                </div>
              </li>
            )}
            <li aria-hidden="true">
              <div ref={messagesEndRef} />
            </li>
          </ul>
        )}
      </div>

      {/* Input */}
      {isViewOnly ? (
        <div className="flex shrink-0 gap-2 border-t border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">You are viewing this chat as a customer. You cannot send messages.</p>
        </div>
      ) : (
      <form
        onSubmit={handleSend}
        className="flex shrink-0 gap-2 border-t border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          disabled={sending || !isValidBooking}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!inputMessage.trim() || sending || !isValidBooking}
          loading={sending}
          className="inline-flex items-center gap-2"
        >
          <Send className="h-4 w-4" aria-hidden />
          Send
        </Button>
      </form>
      )}
    </div>
  );
}

export default function AdminChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/30">
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading chat…</p>
        </div>
      }
    >
      <AdminChatPageContent />
    </Suspense>
  );
}
