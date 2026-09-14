// Registre canonique des modules activables/désactivables — cahier des charges 4.11.
// Réutilisé par le panneau "Modules" (Paramètres) et, en Phase 5, par les permissions
// accordées à chaque utilisateur (Utilisateurs & rôles) : une seule liste, deux usages.

export type ModuleKey =
  | "import_multiphotos"
  | "ai_description"
  | "social_publish"
  | "ads_campaigns"
  | "femme_collection";

export const MODULES: { key: ModuleKey; label: string; description: string }[] = [
  {
    key: "import_multiphotos",
    label: "Import multi-photos",
    description: "Ajout en masse avec attributs par photo",
  },
  {
    key: "ai_description",
    label: "Description par IA",
    description: "Génération automatique à partir de la photo",
  },
  {
    key: "social_publish",
    label: "Réseaux sociaux",
    description: "Publication automatique Facebook / Instagram",
  },
  {
    key: "ads_campaigns",
    label: "Campagnes Ads",
    description: "Meta Ads, Google Ads, TikTok Ads",
  },
  {
    key: "femme_collection",
    label: "Collection Femme",
    description: "Navigation et catégories dédiées",
  },
];

export const DEFAULT_MODULE_FLAGS: Record<ModuleKey, boolean> = {
  import_multiphotos: true,
  ai_description: true,
  social_publish: true,
  ads_campaigns: false,
  femme_collection: true,
};
