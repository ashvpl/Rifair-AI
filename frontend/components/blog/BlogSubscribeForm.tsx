"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BlogSubscribeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <p className="text-xs font-bold text-green-600 py-2">
        ✓ You&apos;re subscribed! Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@company.com"
        className="w-full px-3 py-2 text-xs border border-black/10 rounded-xl focus:outline-none focus:border-black font-semibold"
        required
      />
      <Button className="w-full font-bold bg-black text-white rounded-full py-3 text-xs">
        Subscribe to HR Weekly
      </Button>
    </form>
  );
}
