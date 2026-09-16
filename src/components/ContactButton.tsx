"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle, X, FileText } from "lucide-react";
import { SocialIcon } from "@/components/SocialIcon";

export default function ContactButton({ phone }: { phone?: string }) {
  const [open, setOpen] = useState(false);
  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : undefined;

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {open && (
        <div className="w-56 rounded-2xl bg-[var(--background)] p-2 shadow-2xl ring-1 ring-[var(--accent)]">
          {waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--muted)]"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                <SocialIcon platform="whatsapp" className="h-4 w-4" />
              </span>
              Discuter sur WhatsApp
            </a>
          )}
          <Link
            href="/sur-mesure"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-[var(--muted)]"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--primary)]">
              <FileText className="h-4 w-4" />
            </span>
            Remplir une demande
          </Link>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fermer le contact" : "Nous contacter"}
        aria-expanded={open}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
