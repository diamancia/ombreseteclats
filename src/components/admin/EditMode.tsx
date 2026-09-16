"use client";
import { createContext, useContext, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { TOKEN_KEY } from "@/lib/storage";

// Mode édition directe sur la page ("headless CMS") — activé via ?edit=1 depuis le bouton
// "Éditer" de Paramètres > Navigation, uniquement si un token admin est présent (sinon la
// page s'affiche normalement, sans rien de spécial).
const EditModeContext = createContext(false);

export function useEditMode() {
  return useContext(EditModeContext);
}

function EditModeInner({ children }: { children: React.ReactNode }) {
  const sp = useSearchParams();
  const requested = sp.get("edit") === "1";
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!requested) return;
    setAuthorized(!!localStorage.getItem(TOKEN_KEY));
  }, [requested]);

  const active = requested && authorized;

  return (
    <EditModeContext.Provider value={active}>
      {active && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-[#6c5ce7] py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
          <Pencil className="h-3.5 w-3.5" />
          Mode édition — clique sur un texte encadré pour le modifier
          <a
            href={typeof window !== "undefined" ? window.location.pathname : "/"}
            className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 hover:bg-white/30"
          >
            <X className="h-3 w-3" /> Quitter
          </a>
        </div>
      )}
      {children}
    </EditModeContext.Provider>
  );
}

export default function EditModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <EditModeInner>{children}</EditModeInner>
    </Suspense>
  );
}
