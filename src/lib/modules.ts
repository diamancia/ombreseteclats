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

// Permissions par écran admin — cahier des charges 4.9 (Utilisateurs & rôles).
// Distinctes des ModuleKey ci-dessus : celles-ci activent/désactivent une fonctionnalité pour
// tout le site, alors que PermissionKey détermine à quels écrans un utilisateur donné a accès.
export type PermissionKey = "produits" | "categories" | "commandes" | "parametres" | "utilisateurs";

export const PERMISSIONS: { key: PermissionKey; label: string }[] = [
  { key: "produits", label: "Produits" },
  { key: "categories", label: "Catégories" },
  { key: "commandes", label: "Commandes" },
  { key: "parametres", label: "Paramètres" },
  { key: "utilisateurs", label: "Utilisateurs" },
];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

export type UserRole = "admin" | "community_manager" | "vendeur" | "custom";

export const ROLES: { key: UserRole; label: string }[] = [
  { key: "admin", label: "Administrateur" },
  { key: "community_manager", label: "Community manager" },
  { key: "vendeur", label: "Vendeur" },
  { key: "custom", label: "Personnalisé" },
];

// Préréglage de départ appliqué à la création — modifiable ensuite librement par utilisateur.
export const ROLE_PRESETS: Record<UserRole, PermissionKey[]> = {
  admin: ALL_PERMISSIONS,
  community_manager: ["produits"],
  vendeur: ["commandes"],
  custom: [],
};
