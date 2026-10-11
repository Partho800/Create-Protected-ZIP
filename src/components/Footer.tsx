import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/80 text-zinc-500 text-xs py-8 px-4 sm:px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-300 font-medium">Secure ZIP Creator</span>
          <span>•</span>
          <span>100% Client-Side AES-256 Web Cryptography</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <span>No Server Uploads</span>
          <span>•</span>
          <span>Zero Knowledge</span>
          <span>•</span>
          <span>Open Source</span>
        </div>
      </div>
    </footer>
  );
}
