"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  "missing-token": "Invalid login link. Please request a new one.",
  "invalid-or-expired": "This login link has expired. Please request a new one.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam && ERROR_MESSAGES[errorParam]) {
      setError(ERROR_MESSAGES[errorParam]);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef9f2]">
          <svg className="h-8 w-8 text-[#3FC06B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#222]">Check your email</h2>
        <p className="mt-3 text-[#666]">
          We sent a sign-in link to <strong className="text-[#222]">{email}</strong>
        </p>
        <p className="mt-1 text-sm text-[#999]">The link expires in 15 minutes.</p>
        <button
          onClick={() => { setStatus("idle"); setError(null); }}
          className="mt-6 text-sm font-medium text-[#173BE6] hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-[#222] text-center">Sign in to AACM</h2>
      <p className="mt-2 text-sm text-[#666] text-center">
        Enter your @scrum-academy.com email to receive a sign-in link.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-[#E94560]/20 bg-red-50 px-4 py-3 text-sm text-[#E94560]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#222] mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@scrum-academy.com"
            className="w-full rounded-lg border border-[#E1E1E1] px-4 py-2.5 text-sm text-[#222] placeholder:text-[#999] focus:border-[#3FC06B] focus:outline-none focus:ring-1 focus:ring-[#3FC06B]"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-lg bg-[#3FC06B] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#36a35b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {status === "loading" ? "Sending..." : "Send sign-in link"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/agile-academy-logo.png"
            alt="Agile Academy"
            width={180}
            height={36}
            priority
          />
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
