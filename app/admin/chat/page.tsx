"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Send, Users, X } from "lucide-react";
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

/** Matches server format `[img]/uploads/...[/img]` + optional caption */
function parseEmbeddedChatImage(raw: string): { src: string | null; caption: string } {
  const m = raw.match(/^\[img\]([^\[]+)\[\/img\]\n?([\s\S]*)$/);
  if (m) return { src: m[1].trim(), caption: (m[2] ?? "").trim() };
  return { src: null, caption: raw };
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
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const { sendData: postMessage, loading: sending, error: sendError } = useApi({
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

  const userWithGroup = user as { id?: number; userGroupId?: number } | undefined;
  const bookingRoot =
    bookingData && typeof bookingData === "object"
      ? ((bookingData as { data?: Record<string, unknown> }).data ?? (bookingData as Record<string, unknown>))
      : null;
  const bookingCustomerId =
    bookingRoot &&
    typeof bookingRoot === "object" &&
    typeof (bookingRoot as { userId?: unknown }).userId === "number"
      ? (bookingRoot as { userId: number }).userId
      : NaN;
  const assignedRaw = (bookingRoot as { assignedTo?: unknown } | null)?.assignedTo;
  const bookingEmployeeId =
    typeof assignedRaw === "number" && assignedRaw > 0 ? assignedRaw : NaN;

  /** When `userGroupId === 2`, align by booking parties (customer left, employee right); otherwise by current user. */
  const messageOnRight = (senderId: number) => {
    if (userWithGroup?.userGroupId === 2) {
      if (Number.isInteger(bookingEmployeeId) && senderId === bookingEmployeeId) return true;
      if (Number.isInteger(bookingCustomerId) && senderId === bookingCustomerId) return false;
    }
    return senderId === displayUserId;
  };

  const viewerId = Number(userWithGroup?.id);
  const isMessageFromViewer = (senderId: number) =>
    Number.isInteger(viewerId) && viewerId > 0 && senderId === viewerId;

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

  useEffect(() => {
    if (!pendingImage) {
      setPendingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingImage);
    setPendingPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingImage]);

  const clearPendingImage = () => {
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    setPendingImage(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    const imageToSend = pendingImage;
    if ((!text && !imageToSend) || !isValidBooking || sending) return;
    const prevInput = inputMessage;
    setInputMessage("");
    try {
      let res: { code?: number; data?: unknown; message?: string };
      if (imageToSend) {
        const imageDataUrl = await fileToDataUrl(imageToSend);
        res = (await postMessage({
          bookingId: bookingIdNum,
          message: text,
          imageDataUrl,
        })) as { code?: number; data?: unknown; message?: string };
      } else {
        res = (await postMessage({ bookingId: bookingIdNum, message: text })) as {
          code?: number;
          data?: unknown;
          message?: string;
        };
      }
      if (res?.code === 200 && res?.data) {
        setMessages((prev) => [...prev, res.data as ChatMessage]);
        clearPendingImage();
      } else {
        setInputMessage(prevInput);
        if (imageToSend) {
          setPendingImage(imageToSend);
          if (fileInputRef.current) {
            try {
              const dt = new DataTransfer();
              dt.items.add(imageToSend);
              fileInputRef.current.files = dt.files;
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch {
      setInputMessage(prevInput);
      if (imageToSend) setPendingImage(imageToSend);
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
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/30">
      {/* Header – modern font, aligned with brand */}
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
        <Link
          href={`/admin/employee-bookings/edit/${bookingIdNum}`}
          className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Back to booking"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-medium tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
            {bookingLabel} – {userName}
          </h1>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            chat for this booking
          </p>
        </div>
      </header>

      {/* Chat window – soft background, bubble layout */}
      <div className="flex-1 overflow-y-auto bg-gray-100/80 p-4 flex flex-col items-center transition-opacity duration-200 dark:bg-gray-900/30">
        {chatError ? (
          <p className="text-center text-sm text-red-600 dark:text-red-400">{chatError}</p>
        ) : loadingChat && !hasLoadedOnce ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Loading messages…</p>
        ) : sending && displayMessages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">Sending…</p>
        ) : displayMessages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">No messages yet. Start the conversation.</p>
        ) : (
          <ul className="space-y-3 w-full mx-auto">
            {displayMessages.map((m, idx) => {
              const isRight = messageOnRight(m.senderId);
              const senderName = (m.sender && typeof m.sender === "object" ? m.sender.name : null) ?? "—";
              const displayName = isMessageFromViewer(m.senderId) ? "You" : senderName;
              const timeStr = m.createdAt ? new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

              return (
                <li
                  key={m.id ?? `msg-${idx}`}
                  className={`flex gap-3 ${isRight ? "flex-row-reverse is-me" : "flex-row is-sender"} items-end max-w-[85%] sm:max-w-[90%] ${isRight ? "ml-auto" : "mr-auto"} transition-opacity duration-200`}
                >
                  {/* Avatar/Image comes first */}
                  <AvatarText
                    name={isMessageFromViewer(m.senderId) ? "You" : senderName}
                    className={`shrink-0 h-10 w-10 text-xs ${isRight ? "order-1" : "order-1"}`}
                  />
                  
                  {/* Message content comes second */}
                  <div className={`flex flex-col gap-1 min-w-0 ${isRight ? "items-end order-2" : "items-start order-2"}`}>
                    <div className="flex items-baseline gap-2 px-1 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px]" title={displayName}>
                        {displayName}
                      </span>
                      {timeStr && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">{timeStr}</span>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-lg max-w-full transition-colors duration-150 ${
                        isRight
                          ? "bg-[#b8a9c9] text-gray-900 rounded-br-md hover:bg-[#a898b8] dark:bg-[#9b8aad] dark:hover:bg-[#8a7a9d]"
                          : "bg-[#5b7cba] text-white rounded-bl-md dark:bg-[#4a6aa8] dark:hover:bg-[#5b7cba]"
                      }`}
                    >
                      {(() => {
                        const raw = String(m.message ?? "");
                        const { src, caption } = parseEmbeddedChatImage(raw);
                        return (
                          <>
                            {src ? (
                              // eslint-disable-next-line @next/next/no-img-element -- dynamic chat uploads from same origin
                              <img
                                src={src}
                                alt=""
                                className="mb-2 max-h-48 max-w-full rounded-lg object-contain"
                              />
                            ) : null}
                            {(caption || !src) && (
                              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
                                {src ? caption : raw}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </li>
              );
            })}
            {sending && (
              <li
                className={`flex gap-3 items-end max-w-[85%] sm:max-w-[90%] animate-pulse ${
                  messageOnRight(displayUserId) ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                }`}
              >
                <AvatarText name="You" className="shrink-0 h-10 w-10 text-xs" />
                <div
                  className={`flex flex-col gap-1 ${
                    messageOnRight(displayUserId) ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">You</span>
                  <span
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      messageOnRight(displayUserId)
                        ? "rounded-br-md bg-[#b8a9c9] text-gray-700 dark:bg-[#9b8aad] dark:text-gray-200"
                        : "rounded-bl-md bg-[#5b7cba] text-white dark:bg-[#4a6aa8]"
                    }`}
                  >
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

      {/* Input area – text area + Send (blue/purple, hover) */}

      {userWithGroup?.userGroupId === 2 ? (
        <div className="flex shrink-0 gap-2 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">You are viewing this chat as a customer. You cannot send messages.</p>
        </div>
      ) : (
      <form
        onSubmit={handleSend}
        className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        {pendingPreviewUrl && (
          <div className="relative inline-flex w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img
              src={pendingPreviewUrl}
              alt="Attachment preview"
              className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-600"
            />
            <button
              type="button"
              onClick={clearPendingImage}
              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              aria-label="Remove attachment"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="min-h-[44px] max-h-32 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-[#5b7cba] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5b7cba] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-[#5b7cba] dark:focus:ring-[#5b7cba]"
            disabled={sending || !isValidBooking}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={handlePickImage}
            aria-hidden
          />
          <button
            type="button"
            disabled={sending || !isValidBooking}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-[44px] shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5b7cba] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-[#5b7cba]"
            aria-label="Attach image"
          >
            <ImagePlus className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="submit"
            disabled={(!inputMessage.trim() && !pendingImage) || sending || !isValidBooking}
            className="inline-flex h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5b7cba] px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#4a6aa8] focus:outline-none focus:ring-2 focus:ring-[#5b7cba] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none dark:bg-[#4a6aa8] dark:hover:bg-[#5b7cba] dark:focus:ring-[#5b7cba]"
          >
            {sending ? (
              <span className="text-sm">Sending…</span>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                Send
              </>
            )}
          </button>
        </div>
        {sendError ? (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {sendError}
          </p>
        ) : null}
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
