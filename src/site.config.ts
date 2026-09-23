// ═══════════════════════════════════════════════════════════════════
// SITE CONFIG — Ombre & Éclats (bijouterie pour hommes)
// ═══════════════════════════════════════════════════════════════════

export type Vertical = "patisserie" | "bijouterie" | "fleuriste" | "chocolaterie" | "generic";

export interface VariantConfig {
  key: "flavors" | "sizes";
  label: string;
  labelSingular: string;
  placeholder: string;
  hasImage: boolean;
  enabled: boolean;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface SiteConfig {
  vertical: Vertical;
  brand: {
    name: string;
    tagline: string;
    banner: string;
    bannerSymbol: string;
    logoUrl: string;
    storagePrefix: string;
  };
  theme: {
    background: string;
    foreground: string;
    primary: string;
    primaryDark: string;
    accent: string;
    muted: string;
    // Accent réservé à la collection Femme — cahier des charges 4.6 (section 5 : pas de thème
    // clair global, l'or rosé n'est utilisé que localement sur les blocs/badges Femme).
    roseGold: string;
    // Blanc pur des cartes (produit, avis) — se détache du fond crème sans ombre portée.
    card: string;
    // Doré très pâle — bandeau d'annonces, pastilles d'initiales. Un aplat, pas une bordure.
    goldPale: string;
    // Texte secondaire (légendes, icônes du header) — lisible sans concurrencer --foreground.
    inkSoft: string;
    // Texte tertiaire (sur-titres, copyright, chevrons) — présent mais volontairement en retrait.
    inkFaint: string;
  };
  meta: { title: string; description: string };
  hero: { defaultTitle: string; defaultSubtitle: string; defaultImageUrl: string };
  contact: { email: string; phone: string; zone: string };
  navbar: { links: NavLink[] };
  product: {
    variant1: VariantConfig;
    variant2: VariantConfig;
    hasAllergens: boolean;
    allergensLabel: string;
    delayLabel: string;
    delayUnit: "days" | "hours";
  };
  features: {
    customOrders: boolean;
    pickupCalendar: boolean;
    postalDelivery: boolean;
    whatsappButton: boolean;
  };
  customOrderEvents?: string[];
  defaults: {
    slots: string[];
    openWeekdays: number[];
    minDelay: number;
  };
  legalPreset: "patisserie" | "bijouterie" | "generic";
}

// ═══════════════════════════════════════════════════════════════════
// OMBRE & ÉCLATS — bijouterie argent pour hommes
// Palette : ivoire chaud / noir absolu / beige taupe
// ═══════════════════════════════════════════════════════════════════

export const siteConfig: SiteConfig = {
  vertical: "bijouterie",

  brand: {
    name: "Ombre & Éclats",
    tagline: "Bijouterie d'Homme",
    banner: "ARGENT MASSIF · PIÈCES FAÇONNÉES À LA MAIN · LIVRAISON OFFERTE",
    bannerSymbol: "✧",
    logoUrl: "/logo.png",
    storagePrefix: "ombre-eclats",
  },

  // Palette claire uniquement (mode sombre retiré), accordée sur design/mockup-mobile-flow.html :
  // papier crème chaud, encre brun-noir, or et or foncé. Le site est intégralement clair, header
  // et Hero compris.
  theme: {
    background: "#faf7f0",      // --paper
    foreground: "#2a2519",      // --ink
    primary: "#a3835a",         // --gold
    primaryDark: "#8a6d47",     // --gold-deep : prix, CTA, liens "voir tout"
    accent: "#e6ddc8",          // --line : toutes les bordures
    muted: "#f6f1e6",           // lavis de section — volontairement plus clair que goldPale
    roseGold: "#C9A08A",        // or rosé discret — réservé à la collection Femme
    card: "#ffffff",
    goldPale: "#f1e6d0",
    inkSoft: "#6b6350",
    inkFaint: "#a49c86",
  },

  meta: {
    title: "Ombre & Éclats - Bijoux argent massif 925 pour homme | Livraison offerte",
    description:
      "Découvrez Ombre & Éclats, notre sélection de bagues, chevalières et gourmettes en argent massif 925 façonnées à la main. Livraison rapide, paiement sécurisé.",
  },

  hero: {
    defaultTitle: "UNE PIÈCE UNIQUE ? NOUS LA FAÇONNONS.",
    defaultSubtitle:
      "Gravure d'initiales, chevalière aux armoiries, alliance sur-mesure… Décrivez votre projet, nous vous proposons un devis sous 48h.",
    defaultImageUrl:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1400&auto=format&fit=crop&q=85",
  },

  contact: {
    email: "contact@ombre-eclats.fr",
    phone: "06 24 18 52 07",
    zone: "Livraison France & Europe",
  },

  navbar: {
    links: [
      { href: "/", label: "Accueil" },
      { href: "/catalogue", label: "Boutique" },
      { href: "/catalogue?genre=homme", label: "Collections Homme" },
      { href: "/catalogue?genre=femme", label: "Collections Femme" },
      { href: "/catalogue?genre=enfant", label: "Collections Enfant" },
      { href: "/sur-mesure", label: "Sur-mesure" },
      { href: "/contact", label: "Contact" },
    ],
  },

  product: {
    variant1: {
      key: "flavors",
      label: "Finition",
      labelSingular: "finition",
      placeholder: "Nom de la finition (Poli, Brossé, Noirci…)",
      hasImage: true,
      // Non pertinent pour la bijouterie — désactivé (remplacé par la longueur personnalisable).
      enabled: false,
    },
    variant2: {
      key: "sizes",
      label: "Taille",
      labelSingular: "taille",
      placeholder: "Taille (ex: 58, 60, 19cm…)",
      hasImage: false,
      // Remplacé par le sélecteur de longueur de chaîne (product.customLength).
      enabled: false,
    },
    hasAllergens: false,
    allergensLabel: "Matière & entretien",
    delayLabel: "Délai d'expédition",
    delayUnit: "days",
  },

  features: {
    customOrders: true,
    pickupCalendar: false,
    postalDelivery: true,
    whatsappButton: true,
  },

  // Types de pièces proposées en création sur-mesure (dropdown du formulaire /sur-mesure).
  customOrderEvents: [
    "Bague",
    "Bracelet",
    "Collier",
    "Pendentif",
    "Boucles d'oreilles",
    "Broche",
    "Mdemma",
    "Gourmette",
    "Autre",
  ],

  defaults: {
    slots: [],
    openWeekdays: [1, 2, 3, 4, 5, 6],
    minDelay: 2,
  },

  legalPreset: "bijouterie",
};
