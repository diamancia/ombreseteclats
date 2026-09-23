import Link from "next/link";

// En-tête de rangée produits : titre à gauche, lien « voir tout » à droite, alignés sur la même
// ligne de base. Volontairement compact (pas de filet centré ni de grande marge) — c'est ce qui
// donne le même rythme vertical à toutes les sections de l'accueil.
export default function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-4 sm:mb-6">
      <h2 className="font-serif text-[17px] font-medium sm:text-2xl lg:text-3xl">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="flex-shrink-0 text-[10px] tracking-[0.03em] text-[var(--primary-dark)] hover:underline sm:text-xs"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
