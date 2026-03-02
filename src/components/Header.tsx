"use client";

import Image from "next/image";

type Mode = "review" | "create";

interface HeaderProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "create", label: "Create" },
  { value: "review", label: "Review" },
];

export default function Header({ activeMode, onModeChange, userEmail, onSignOut }: HeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4 bg-white">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/agile-academy-logo.png"
            alt="Agile Academy"
            width={140}
            height={28}
            priority
          />
          <span className="text-base font-bold text-text-primary border-l border-border pl-3">Agile Academy Content Machine</span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-1 rounded-[0.75rem] bg-surface p-1">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onModeChange(mode.value)}
                className={`px-4 py-1.5 text-sm font-bold tracking-wide rounded-[0.5rem] transition-colors ${
                  activeMode === mode.value
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </nav>
          {userEmail && (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <span className="text-xs text-text-muted">{userEmail}</span>
              <button
                onClick={onSignOut}
                className="text-xs font-medium text-text-muted hover:text-[#E94560] transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
