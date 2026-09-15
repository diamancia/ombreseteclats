// Point d'entrée unique pour la couche d'accès Supabase — joue le même rôle que
// src/lib/models.ts avant la migration (un seul import pour toutes les entités).
export * from "./client";
export * from "./products";
export * from "./categories";
export * from "./orders";
export * from "./settings";
export * from "./users";
export * from "./notifications";
export * from "./landingPages";
export * from "./googleReviewsCache";
