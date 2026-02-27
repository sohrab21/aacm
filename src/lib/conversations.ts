// --- Types ---

export interface SerializedChatMessage {
  id: string;
  role: "system" | "user";
  type: "text" | "status" | "proposals" | "draft";
  content: string;
  timestamp: string; // ISO string
  // proposals fields
  proposals?: string[];
  // draft fields
  review?: string;
  rating?: number | null;
  iteration?: number;
  isFinal?: boolean;
  statusNote?: string;
}

export interface StoredConversation {
  id: string;
  title: string;
  contentType: string;
  qualityThreshold?: number;
  maxIterations?: number;
  lastResearchContext: string;
  currentProposals: string[];
  awaitingSelection: boolean;
  interviewQuestions?: string[];
  interviewAnswers?: string[];
  interviewTopic?: string;
  awaitingRevisionNotes?: boolean;
  revisionCount?: number;
  lastDraftForRevision?: string;
  lastReviewForRevision?: string;
  lastTopicForRevision?: string;
  messages: SerializedChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "aacm_conversations";

// --- Helpers ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateTitle(messages: SerializedChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user" && m.type === "text");
  if (!firstUserMsg) return "New conversation";
  const text = firstUserMsg.content.trim();
  return text.length > 50 ? text.slice(0, 50) + "..." : text;
}

function readAll(): StoredConversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(conversations: StoredConversation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

// --- Public API ---

export function listConversations(): StoredConversation[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function loadConversation(id: string): StoredConversation | null {
  return readAll().find((c) => c.id === id) ?? null;
}

export function saveConversation(
  conv: Omit<StoredConversation, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
  }
): StoredConversation {
  const all = readAll();
  const now = new Date().toISOString();
  const existing = conv.id ? all.find((c) => c.id === conv.id) : null;

  const saved: StoredConversation = {
    ...conv,
    id: existing?.id ?? conv.id ?? generateId(),
    title: generateTitle(conv.messages),
    createdAt: existing?.createdAt ?? conv.createdAt ?? now,
    updatedAt: now,
  };

  if (existing) {
    const idx = all.indexOf(existing);
    all[idx] = saved;
  } else {
    all.push(saved);
  }

  writeAll(all);
  return saved;
}

export function deleteConversation(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id));
}

export function newConversationId(): string {
  return generateId();
}
