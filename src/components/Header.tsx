"use client";

import Image from "next/image";

interface HeaderProps {
  userEmail?: string | null;
  onSignOut?: () => void;
}

export default function Header({ userEmail, onSignOut }: HeaderProps) {
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
          {userEmail && (
            <div className="flex items-center gap-3">
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
