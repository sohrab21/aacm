"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReviewOutput from "./ReviewOutput";
import {
  type StoredConversation,
  type SerializedChatMessage,
  listConversations,
  loadConversation,
  saveConversation,
  deleteConversation,
  newConversationId,
} from "@/lib/conversations";

// --- Types ---

type MessageRole = "system" | "user";

interface BaseMessage {
  id: string;
  role: MessageRole;
  timestamp: Date;
}

interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
}

interface StatusMessage extends BaseMessage {
  type: "status";
  content: string;
}

interface ProposalsMessage extends BaseMessage {
  type: "proposals";
  content: string;
  proposals: string[];
}

interface DraftMessage extends BaseMessage {
  type: "draft";
  content: string;
  review: string;
  rating: number | null;
  iteration: number;
  isFinal: boolean;
  statusNote: string;
}

type ChatMessage = TextMessage | StatusMessage | ProposalsMessage | DraftMessage;

// --- Serialization ---

function serializeMessages(messages: ChatMessage[]): SerializedChatMessage[] {
  return messages.map((msg) => {
    const base: SerializedChatMessage = {
      id: msg.id,
      role: msg.role,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    };
    if (msg.type === "proposals") {
      base.proposals = (msg as ProposalsMessage).proposals;
    }
    if (msg.type === "draft") {
      const d = msg as DraftMessage;
      base.review = d.review;
      base.rating = d.rating;
      base.iteration = d.iteration;
      base.isFinal = d.isFinal;
      base.statusNote = d.statusNote;
    }
    return base;
  });
}

function deserializeMessages(messages: SerializedChatMessage[]): ChatMessage[] {
  return messages.map((msg) => {
    const base = {
      id: msg.id,
      role: msg.role,
      timestamp: new Date(msg.timestamp),
    };
    switch (msg.type) {
      case "proposals":
        return { ...base, type: "proposals" as const, content: msg.content, proposals: msg.proposals ?? [] };
      case "draft":
        return {
          ...base,
          type: "draft" as const,
          content: msg.content,
          review: msg.review ?? "",
          rating: msg.rating ?? null,
          iteration: msg.iteration ?? 1,
          isFinal: msg.isFinal ?? false,
          statusNote: msg.statusNote ?? "",
        };
      case "status":
        return { ...base, type: "status" as const, content: msg.content };
      default:
        return { ...base, type: "text" as const, content: msg.content };
    }
  });
}

// --- Helpers ---

function parseProposals(text: string): string[] {
  const blocks = text.split(/(?=(?:^|\n)\s*\**\d+\.\s)/);
  const parsed = blocks
    .map((b) => b.trim())
    .filter((b) => /^\**\d+\.\s/.test(b));
  // If parsing fails, return the full text as a single entry
  if (parsed.length === 0 && text.trim()) return [text.trim()];
  return parsed;
}

function getRatingColor(rating: number): string {
  if (rating <= 3) return "text-accent-danger";
  if (rating <= 5) return "text-orange-600";
  if (rating <= 7) return "text-yellow-600";
  return "text-accent";
}

function msgId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const WELCOME_MESSAGE: ChatMessage = {
  id: msgId(),
  role: "system",
  type: "text",
  content:
    "What would you like to write?\n\nYou can:\n\u2022 Describe a specific topic and I'll write a draft directly\n\u2022 Describe a content area to explore and I'll research what's out there, propose differentiated angles, then write\n\nTip: The more you give me, the stronger the first draft. Case studies, data points, sources, and the core mechanism you want explained all help.",
  timestamp: new Date(),
};

// --- Props ---

interface CreateChatProps {
  onSendToReview: (draft: string, contentType: string) => void;
}

// --- Component ---

export default function CreateChat({ onSendToReview }: CreateChatProps) {
  // Conversation state
  const [conversationId, setConversationId] = useState<string>(() => newConversationId());
  const [messages, setMessages] = useState<ChatMessage[]>([{ ...WELCOME_MESSAGE, id: msgId() }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("Website Article");
  const [awaitingSelection, setAwaitingSelection] = useState(false);
  const [currentProposals, setCurrentProposals] = useState<string[]>([]);
  const [lastResearchContext, setLastResearchContext] = useState("");
  const [copiedDraft, setCopiedDraft] = useState<string | null>(null);

  // Interview state
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const [interviewTopic, setInterviewTopic] = useState("");
  const isInterviewing = interviewQuestions.length > 0 && interviewAnswers.length < interviewQuestions.length;

  // Revision state
  const [awaitingRevisionNotes, setAwaitingRevisionNotes] = useState(false);
  const [revisionCount, setRevisionCount] = useState(1);
  const [lastDraftForRevision, setLastDraftForRevision] = useState("");
  const [lastReviewForRevision, setLastReviewForRevision] = useState("");
  const [lastTopicForRevision, setLastTopicForRevision] = useState("");

  // Sidebar state
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load conversation list on mount
  useEffect(() => {
    setConversations(listConversations());
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  // Auto-save with debounce (save 500ms after last message change)
  const doSave = useCallback(() => {
    // Only save if there's user content (more than just the welcome message)
    const hasUserContent = messages.some((m) => m.role === "user");
    if (!hasUserContent) return;

    // Don't persist status messages (transient loading states)
    const persistableMessages = messages.filter((m) => m.type !== "status");

    const saved = saveConversation({
      id: conversationId,
      title: "", // auto-generated by saveConversation
      contentType,
      lastResearchContext,
      currentProposals,
      awaitingSelection,
      interviewQuestions: interviewQuestions.length > 0 ? interviewQuestions : undefined,
      interviewAnswers: interviewAnswers.length > 0 ? interviewAnswers : undefined,
      interviewTopic: interviewTopic || undefined,
      awaitingRevisionNotes: awaitingRevisionNotes || undefined,
      revisionCount: revisionCount > 1 ? revisionCount : undefined,
      lastDraftForRevision: lastDraftForRevision || undefined,
      lastReviewForRevision: lastReviewForRevision || undefined,
      lastTopicForRevision: lastTopicForRevision || undefined,
      messages: serializeMessages(persistableMessages),
    });
    setConversationId(saved.id);
    setConversations(listConversations());
  }, [messages, conversationId, contentType, lastResearchContext, currentProposals, awaitingSelection, interviewQuestions, interviewAnswers, interviewTopic, awaitingRevisionNotes, revisionCount, lastDraftForRevision, lastReviewForRevision, lastTopicForRevision]);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(doSave, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [doSave]);

  // --- Conversation management ---

  const handleNewConversation = () => {
    if (isLoading) return;
    // Save current first
    doSave();
    // Reset all state
    const newId = newConversationId();
    setConversationId(newId);
    setMessages([{ ...WELCOME_MESSAGE, id: msgId(), timestamp: new Date() }]);
    setInput("");
    setContentType("Website Article");
    setAwaitingSelection(false);
    setCurrentProposals([]);
    setLastResearchContext("");
    setCopiedDraft(null);
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setInterviewTopic("");
    setAwaitingRevisionNotes(false);
    setRevisionCount(1);
    setLastDraftForRevision("");
    setLastReviewForRevision("");
    setLastTopicForRevision("");
  };

  const handleLoadConversation = (id: string) => {
    if (isLoading || id === conversationId) return;
    // Save current first
    doSave();
    const conv = loadConversation(id);
    if (!conv) return;
    setConversationId(conv.id);
    setMessages(deserializeMessages(conv.messages));
    setContentType(conv.contentType);
    setLastResearchContext(conv.lastResearchContext);
    setCurrentProposals(conv.currentProposals);
    setAwaitingSelection(conv.awaitingSelection);
    const restoredQuestions = conv.interviewQuestions ?? [];
    const restoredAnswers = conv.interviewAnswers ?? [];
    setInterviewQuestions(restoredQuestions);
    setInterviewAnswers(restoredAnswers);
    setInterviewTopic(conv.interviewTopic ?? "");
    setInput("");
    setCopiedDraft(null);
    setAwaitingRevisionNotes(conv.awaitingRevisionNotes ?? false);
    setRevisionCount(conv.revisionCount ?? 1);
    setLastDraftForRevision(conv.lastDraftForRevision ?? "");
    setLastReviewForRevision(conv.lastReviewForRevision ?? "");
    setLastTopicForRevision(conv.lastTopicForRevision ?? "");

    // If mid-interview, show the next question
    if (restoredQuestions.length > 0 && restoredAnswers.length < restoredQuestions.length) {
      const nextIdx = restoredAnswers.length;
      const msgs = deserializeMessages(conv.messages);
      const lastMsg = msgs[msgs.length - 1];
      const nextQ = `Q${nextIdx + 1}: ${restoredQuestions[nextIdx]}`;
      // Only add if the last message isn't already this question
      if (!lastMsg || lastMsg.content !== nextQ) {
        setMessages((prev) => [
          ...prev,
          {
            id: msgId(),
            role: "system" as const,
            type: "text" as const,
            content: nextQ,
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
    setConversations(listConversations());
    // If we deleted the active conversation, start a new one
    if (id === conversationId) {
      handleNewConversation();
    }
  };

  // --- Message helpers ---

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const updateLastSystemMessage = (updater: (msg: ChatMessage) => ChatMessage) => {
    setMessages((prev) => {
      const idx = prev.length - 1;
      if (idx >= 0 && prev[idx].role === "system") {
        const updated = [...prev];
        updated[idx] = updater(prev[idx]);
        return updated;
      }
      return prev;
    });
  };

  // Detect whether user wants direct writing or exploration
  const isDirectWriteRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    const exploreSignals = [
      "explore", "research", "what should", "what could", "ideas for",
      "topics about", "what's out there", "content opportunities",
      "what can we write", "suggest", "propose", "landscape",
    ];
    if (exploreSignals.some((s) => lower.includes(s))) return false;

    const directSignals = [
      "write about", "write a", "draft a", "create a", "article about",
      "post about", "piece about", "paper on", "paper about",
    ];
    if (directSignals.some((s) => lower.includes(s))) return true;

    if (text.length > 100) return true;
    return false;
  };

  // Handle user submitting text
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    addMessage({
      id: msgId(),
      role: "user",
      type: "text",
      content: text,
      timestamp: new Date(),
    });

    if (isInterviewing) {
      handleInterviewAnswer(text);
    } else if (awaitingRevisionNotes) {
      startRevising(text);
    } else if (awaitingSelection) {
      handleTopicSelection(text);
    } else if (isDirectWriteRequest(text)) {
      startInterview(text);
    } else {
      handleResearch(text);
    }
  };

  // Research phase
  const handleResearch = async (contentArea: string) => {
    setIsLoading(true);
    setAwaitingSelection(false);

    const statusId = msgId();
    addMessage({
      id: statusId,
      role: "system",
      type: "status",
      content: "Researching the content landscape...",
      timestamp: new Date(),
    });

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "research",
          contentArea,
          contentType,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const proposals = parseProposals(result.proposals);
      setCurrentProposals(proposals);
      setAwaitingSelection(true);
      setLastResearchContext(result.researchContext || "");

      updateLastSystemMessage(() => ({
        id: statusId,
        role: "system" as const,
        type: "proposals" as const,
        content: result.hasWebSearch
          ? "Here are 5 topic ideas based on live web research and Agile Academy's positioning. Pick one by number, or tell me what you'd like to adjust."
          : "Here are 5 topic ideas based on content analysis. Pick one by number, or tell me what you'd like to adjust.",
        proposals,
        timestamp: new Date(),
      }));
    } catch (err: unknown) {
      updateLastSystemMessage(() => ({
        id: statusId,
        role: "system" as const,
        type: "text" as const,
        content: `Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Try again.`,
        timestamp: new Date(),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text-based topic selection
  const handleTopicSelection = (text: string) => {
    const numMatch = text.match(/\b([1-5])\b/);
    if (numMatch && currentProposals.length > 0) {
      const idx = parseInt(numMatch[1]) - 1;
      if (idx >= 0 && idx < currentProposals.length) {
        setAwaitingSelection(false);
        startInterview(currentProposals[idx]);
        return;
      }
    }

    const lowerText = text.toLowerCase();
    if (
      lowerText.includes("first") ||
      lowerText.includes("#1") ||
      lowerText.includes("number 1") ||
      lowerText.includes("option 1")
    ) {
      if (currentProposals[0]) {
        setAwaitingSelection(false);
        startInterview(currentProposals[0]);
        return;
      }
    }

    if (
      lowerText.includes("more") ||
      lowerText.includes("different") ||
      lowerText.includes("instead") ||
      lowerText.includes("focus") ||
      lowerText.includes("about") ||
      lowerText.includes("try") ||
      lowerText.includes("what about") ||
      lowerText.includes("explore") ||
      lowerText.includes("something")
    ) {
      setAwaitingSelection(false);
      handleResearch(text);
      return;
    }

    setAwaitingSelection(false);
    startInterview(text);
  };

  // Interview phase
  const startInterview = async (topic: string) => {
    setIsLoading(true);
    setInterviewTopic(topic);

    const statusId = msgId();
    addMessage({
      id: statusId,
      role: "system",
      type: "status",
      content: "Preparing a few quick questions to personalize your draft...",
      timestamp: new Date(),
    });

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "interview",
          topic,
          contentType,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const questions: string[] = result.questions;
      if (!questions || questions.length === 0) throw new Error("No questions returned");

      setInterviewQuestions(questions);
      setInterviewAnswers([]);

      // Replace status with the first question
      updateLastSystemMessage(() => ({
        id: statusId,
        role: "system" as const,
        type: "text" as const,
        content: `Before I write, a few quick questions to make the draft yours (type "skip" to start writing immediately).\n\nQ1: ${questions[0]}`,
        timestamp: new Date(),
      }));
    } catch {
      // Graceful fallback: skip interview, write directly
      setInterviewQuestions([]);
      setInterviewAnswers([]);
      setInterviewTopic("");
      setMessages((prev) => prev.filter((m) => m.id !== statusId));
      startWriting(topic);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterviewAnswer = (text: string) => {
    const skipPhrases = ["skip", "just write it", "skip interview", "go ahead", "start writing"];
    const isSkip = skipPhrases.some((phrase) => text.toLowerCase().trim() === phrase);

    if (isSkip) {
      finishInterview(interviewAnswers.length > 0 ? interviewAnswers : undefined);
      return;
    }

    const newAnswers = [...interviewAnswers, text];
    setInterviewAnswers(newAnswers);

    const nextIdx = newAnswers.length;
    if (nextIdx < interviewQuestions.length) {
      // Show next question
      addMessage({
        id: msgId(),
        role: "system",
        type: "text",
        content: `Q${nextIdx + 1}: ${interviewQuestions[nextIdx]}`,
        timestamp: new Date(),
      });
    } else {
      // All questions answered
      finishInterview(newAnswers);
    }
  };

  const finishInterview = (answers?: string[]) => {
    let interviewContext: string | undefined;

    if (answers && answers.length > 0) {
      const pairs = answers.map((a, i) => {
        const q = interviewQuestions[i] || `Question ${i + 1}`;
        return `Q: ${q}\nA: ${a}`;
      });
      interviewContext = pairs.join("\n\n");
    }

    addMessage({
      id: msgId(),
      role: "system",
      type: "text",
      content: answers && answers.length > 0
        ? "Got it, thanks! Writing your personalized draft now..."
        : "No problem, writing the draft now...",
      timestamp: new Date(),
    });

    const topic = interviewTopic;
    // Reset interview state
    setInterviewQuestions([]);
    setInterviewAnswers([]);
    setInterviewTopic("");
    startWriting(topic, interviewContext);
  };

  // Shared SSE stream processor for write and revise phases
  const processWriteStream = async (response: Response, statusId: string): Promise<{ draft: string; review: string } | null> => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response stream.");

    const decoder = new TextDecoder();
    let buffer = "";
    let finalDraft = "";
    let finalReview = "";

    setMessages((prev) => prev.filter((m) => m.id !== statusId));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let eventType = "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7);
        } else if (line.startsWith("data: ") && eventType) {
          const data = JSON.parse(line.slice(6));

          switch (eventType) {
            case "status":
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.type === "status") {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...lastMsg,
                    content: data.message,
                  };
                  return updated;
                }
                return [
                  ...prev,
                  {
                    id: msgId(),
                    role: "system" as const,
                    type: "status" as const,
                    content: data.message,
                    timestamp: new Date(),
                  },
                ];
              });
              break;

            case "iteration":
              setMessages((prev) => {
                const filtered = prev.filter(
                  (m) => !(m.type === "status" && m.role === "system")
                );
                return [
                  ...filtered,
                  {
                    id: msgId(),
                    role: "system" as const,
                    type: "draft" as const,
                    content: data.draft,
                    review: data.review,
                    rating: data.rating,
                    iteration: data.iteration,
                    isFinal: false,
                    statusNote: `Iteration ${data.iteration}: scored ${data.rating ?? "?"}/10`,
                    timestamp: new Date(),
                  },
                ];
              });
              break;

            case "complete":
              finalDraft = data.finalDraft;
              finalReview = data.finalReview;
              setMessages((prev) => {
                const filtered = prev.filter(
                  (m) => !(m.type === "status" && m.role === "system")
                );
                const lastDraftIdx = filtered.findLastIndex(
                  (m) => m.type === "draft"
                );
                if (lastDraftIdx >= 0) {
                  filtered[lastDraftIdx] = {
                    ...(filtered[lastDraftIdx] as DraftMessage),
                    content: data.finalDraft,
                    review: data.finalReview,
                    isFinal: true,
                    statusNote: data.message,
                  };
                }
                return filtered;
              });
              break;

            case "error":
              addMessage({
                id: msgId(),
                role: "system",
                type: "text",
                content: `Error: ${data.error}`,
                timestamp: new Date(),
              });
              break;
          }
          eventType = "";
        }
      }
    }

    if (finalDraft) {
      return { draft: finalDraft, review: finalReview };
    }
    return null;
  };

  // Write phase
  const startWriting = async (topic: string, interviewContext?: string) => {
    setIsLoading(true);
    setAwaitingSelection(false);
    setLastTopicForRevision(topic);

    const statusId = msgId();
    addMessage({
      id: statusId,
      role: "system",
      type: "status",
      content: "Writing first draft...",
      timestamp: new Date(),
    });

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "write",
          selectedTopic: topic,
          contentType,
          researchContext: lastResearchContext,
          interviewContext,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      const result = await processWriteStream(response, statusId);

      if (result) {
        setLastDraftForRevision(result.draft);
        setLastReviewForRevision(result.review);
        setRevisionCount(1);
      }

      addMessage({
        id: msgId(),
        role: "system",
        type: "text",
        content:
          "Done. You can copy the draft, revise it with new notes, send it to Review for a fresh Bar Raiser critique, or tell me what to write next.",
        timestamp: new Date(),
      });
    } catch (err: unknown) {
      addMessage({
        id: msgId(),
        role: "system",
        type: "text",
        content: `Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Try again.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
      setAwaitingSelection(false);
    }
  };

  // Revision flow
  const handleRequestRevision = (draft: string, review: string) => {
    setLastDraftForRevision(draft);
    setLastReviewForRevision(review);
    setAwaitingRevisionNotes(true);

    addMessage({
      id: msgId(),
      role: "system",
      type: "text",
      content:
        "What should the revision focus on? Describe what to improve, or just press Enter for an automatic revision based on the Bar Raiser feedback.",
      timestamp: new Date(),
    });
  };

  const startRevising = async (notes: string) => {
    setAwaitingRevisionNotes(false);
    setIsLoading(true);

    const nextRevision = revisionCount + 1;

    const statusId = msgId();
    addMessage({
      id: statusId,
      role: "system",
      type: "status",
      content: `Writing revision ${nextRevision}...`,
      timestamp: new Date(),
    });

    try {
      const response = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase: "revise",
          previousDraft: lastDraftForRevision,
          previousReview: lastReviewForRevision,
          revisionNotes: notes,
          selectedTopic: lastTopicForRevision,
          contentType,
          researchContext: lastResearchContext,
          revisionNumber: nextRevision,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      const result = await processWriteStream(response, statusId);

      if (result) {
        setLastDraftForRevision(result.draft);
        setLastReviewForRevision(result.review);
        setRevisionCount(nextRevision);
      }

      addMessage({
        id: msgId(),
        role: "system",
        type: "text",
        content:
          "Revision complete. You can copy the draft, revise again, send it to Review, or tell me what to write next.",
        timestamp: new Date(),
      });
    } catch (err: unknown) {
      addMessage({
        id: msgId(),
        role: "system",
        type: "text",
        content: `Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Try again.`,
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDraft = async (draft: string) => {
    await navigator.clipboard.writeText(draft);
    setCopiedDraft(draft);
    setTimeout(() => setCopiedDraft(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Settings bar */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Type:</span>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="bg-input-bg border border-border rounded px-2 py-1 text-xs text-text-primary"
          >
            {["LinkedIn Post", "Website Article", "Whitepaper", "Newspaper Article", "IMD Article"].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main area: sidebar + chat */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } shrink-0 transition-all duration-200 overflow-hidden border-r border-border`}
        >
          <div className="w-64 h-full flex flex-col">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">History</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-0.5 rounded hover:bg-surface-light transition-colors"
                  title="Collapse sidebar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleNewConversation}
                disabled={isLoading}
                className="flex items-center gap-1 rounded-[4px] bg-accent px-2.5 py-1 text-xs font-bold tracking-wide text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="px-3 py-6 text-xs text-text-muted text-center">
                  No conversations yet. Start writing to save your first one.
                </p>
              ) : (
                <div className="py-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleLoadConversation(conv.id)}
                      className={`group flex items-start gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                        conv.id === conversationId
                          ? "bg-accent/10 border-r-2 border-accent"
                          : "hover:bg-surface"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${
                          conv.id === conversationId ? "font-medium text-text-primary" : "text-text-secondary"
                        }`}>
                          {conv.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-light text-text-muted font-medium">
                            {conv.contentType}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {relativeTime(conv.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 p-1 rounded hover:bg-surface-light transition-opacity"
                        title="Delete conversation"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-muted hover:text-accent-danger">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* History reopen button when sidebar is collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="self-start flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              History
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* User message */}
                {msg.role === "user" && msg.type === "text" && (
                  <div className="flex justify-end">
                    <div className="bg-accent/10 rounded-lg px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-text-primary">{msg.content}</p>
                    </div>
                  </div>
                )}

                {/* System text message */}
                {msg.role === "system" && msg.type === "text" && (
                  <div className="flex justify-start">
                    <div className="bg-surface rounded-lg border border-border px-4 py-3 max-w-[90%]">
                      <p className="text-sm text-text-secondary">{msg.content}</p>
                    </div>
                  </div>
                )}

                {/* Status message */}
                {msg.type === "status" && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <svg
                        className="animate-spin h-3 w-3 text-text-muted"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      <span className="text-xs text-text-muted">{msg.content}</span>
                    </div>
                  </div>
                )}

                {/* Proposals message */}
                {msg.type === "proposals" && (
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="bg-surface rounded-lg border border-border px-4 py-3 max-w-[90%]">
                        <p className="text-sm text-text-secondary">{msg.content}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-surface rounded-lg border border-border px-5 py-4 max-w-[90%]">
                        <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                          {(msg as ProposalsMessage).proposals.length > 0 ? (
                            (msg as ProposalsMessage).proposals.map((proposal, idx) => (
                              <div key={idx} className={idx > 0 ? "mt-4 pt-4 border-t border-border" : ""}>
                                {proposal}
                              </div>
                            ))
                          ) : (
                            <p>{(msg as ProposalsMessage).content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Draft message */}
                {msg.type === "draft" && (
                  <div className="space-y-3">
                    {/* Draft header */}
                    <div className="flex items-center gap-2 px-2">
                      {(msg as DraftMessage).isFinal ? (
                        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                          Final Draft
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-text-muted">
                          {(msg as DraftMessage).statusNote}
                        </span>
                      )}
                      {(msg as DraftMessage).rating !== null && (
                        <span
                          className={`text-sm font-bold ${getRatingColor((msg as DraftMessage).rating!)}`}
                        >
                          {(msg as DraftMessage).rating}/10
                        </span>
                      )}
                    </div>

                    {/* Draft content */}
                    <div className="rounded-[0.75rem] border border-border bg-surface shadow-[var(--shadow-s)]">
                      <div className="px-5 py-4 max-h-96 overflow-y-auto">
                        {(msg as DraftMessage).content
                          .split("\n")
                          .map((line, i) => {
                            if (!line.trim()) return <br key={i} />;
                            if (line.startsWith("# "))
                              return (
                                <h1
                                  key={i}
                                  className="text-lg font-bold text-text-primary mt-3 mb-1"
                                >
                                  {line.replace(/^#\s+/, "")}
                                </h1>
                              );
                            if (line.startsWith("## "))
                              return (
                                <h2
                                  key={i}
                                  className="text-base font-bold text-text-primary mt-3 mb-1"
                                >
                                  {line.replace(/^##\s+/, "")}
                                </h2>
                              );
                            if (line.startsWith("### "))
                              return (
                                <h3
                                  key={i}
                                  className="text-sm font-semibold text-text-primary mt-2 mb-1"
                                >
                                  {line.replace(/^###\s+/, "")}
                                </h3>
                              );
                            return (
                              <p
                                key={i}
                                className="text-sm text-text-secondary leading-relaxed mb-1"
                              >
                                {line}
                              </p>
                            );
                          })}
                      </div>

                      {/* Action buttons */}
                      {(msg as DraftMessage).isFinal && (
                        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                          <button
                            onClick={() =>
                              handleCopyDraft((msg as DraftMessage).content)
                            }
                            className="rounded-[4px] border border-border px-3 py-1.5 text-xs font-bold tracking-wide text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
                          >
                            {copiedDraft === (msg as DraftMessage).content
                              ? "Copied!"
                              : "Copy Draft"}
                          </button>
                          <button
                            onClick={() =>
                              handleRequestRevision(
                                (msg as DraftMessage).content,
                                (msg as DraftMessage).review
                              )
                            }
                            disabled={isLoading}
                            className="rounded-[4px] border-2 border-accent px-3 py-1.5 text-xs font-bold tracking-wide text-accent transition-colors hover:bg-accent/10 disabled:opacity-40"
                          >
                            Revise
                          </button>
                          <button
                            onClick={() =>
                              onSendToReview(
                                (msg as DraftMessage).content,
                                contentType
                              )
                            }
                            className="rounded-[4px] border border-border px-3 py-1.5 text-xs font-bold tracking-wide text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
                          >
                            Send to Review
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Review output for final drafts */}
                    {(msg as DraftMessage).isFinal &&
                      (msg as DraftMessage).review && (
                        <ReviewOutput review={(msg as DraftMessage).review} />
                      )}

                    {/* Status note for final */}
                    {(msg as DraftMessage).isFinal && (
                      <p className="text-xs text-text-muted text-center px-2">
                        {(msg as DraftMessage).statusNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border pt-4 px-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isInterviewing
                    ? 'Answer the question above, or type "skip" to start writing...'
                    : awaitingRevisionNotes
                    ? "Describe what the revision should focus on..."
                    : awaitingSelection
                    ? "Type a number (1-5) to pick a topic, or describe what you'd prefer..."
                    : "Describe what you want to write, or a content area to explore..."
                }
                rows={2}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-border bg-input-bg p-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent resize-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="self-end rounded-[4px] bg-accent px-4 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2 text-center">
              Enter to send. Shift+Enter for new line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
