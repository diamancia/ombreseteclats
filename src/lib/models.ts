import mongoose, { Schema, InferSchemaType, Model } from "mongoose";
import { siteConfig } from "@/site.config";
import { DEFAULT_MODULE_FLAGS } from "@/lib/modules";
import { DEFAULT_METAL_TYPES, DEFAULT_GOLD_COLORS } from "@/lib/metals";

// User — cahier des charges 4.9 (Utilisateurs & rôles). Comptes créés par le superadmin
// uniquement (pas d'auto-inscription) : login/mot de passe attribués depuis /admin/utilisateurs.
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "community_manager", "vendeur", "custom"],
      default: "custom",
    },
    modules: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export type UserDoc = InferSchemaType<typeof UserSchema>;
export const User: Model<UserDoc> = mongoose.models.User || mongoose.model("User", UserSchema);

// Notification — messagerie interne du site (achats et autres événements clés), demandée en
// complément du cahier des charges. Boîte partagée entre les utilisateurs admin.
const NotificationSchema = new Schema(
  {
    type: { type: String, enum: ["order", "system"], default: "system" },
    title: { type: String, required: true },
    body: String,
    link: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export type NotificationDoc = InferSchemaType<typeof NotificationSchema>;
export const Notification: Model<NotificationDoc> =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// Category
const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    active: { type: Boolean, default: true },
    // Collection Femme — cahier des charges 4.6 (catégories dédiées, optionnel)
    gender: { type: String, enum: ["homme", "femme", "mixte"] },
    // Sous-catégories : une catégorie sans parent est une catégorie principale ; une
    // catégorie avec parent est une sous-catégorie (un seul niveau de profondeur).
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  },
  { timestamps: true }
);
export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category: Model<CategoryDoc> =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);

// Product
const FlavorSchema = new Schema(
  { name: String, imageUrl: String, surcharge: { type: Number, default: 0 } },
  { _id: true }
);
const SizeSchema = new Schema(
  { name: String, surcharge: { type: Number, default: 0 } },
  { _id: true }
);
const StoneSchema = new Schema(
  {
    nature: { type: String, enum: ["naturelle", "synthetique", "diamant"] },
    shape: {
      type: String,
      enum: ["rond", "ovale", "princesse", "coeur", "emeraude", "poire", "marquise", "coussin"],
    },
    carats: Number,
    centralDescription: String,
    secondaryDescription: String,
  },
  { _id: false }
);
const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    shortDesc: { type: String, trim: true },
    longDesc: String,
    basePrice: { type: Number, required: true, min: 0 },
    delay: { type: Number, default: 2 },
    isNew: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["available", "unavailable", "soon", "pending"],
      default: "available",
    },
    imageUrl: String,
    images: { type: [String], default: [] },
    allergens: String,
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    // Collection Femme — cahier des charges 4.6
    gender: { type: String, enum: ["homme", "femme", "mixte"], default: "homme" },
    flavors: [FlavorSchema],
    sizes: [SizeSchema],
    // Attributs avancés (bijouterie) — cahier des charges 4.2
    jewelryType: {
      type: String,
      enum: [
        "bague",
        "bracelet",
        "collier",
        "gourmette_cheville",
        "boucle_oreille",
        "ceinture_traditionnelle",
        "broche",
        "perles",
        "cordon",
      ],
    },
    dimensionValue: String,
    stone: StoneSchema,
    // Métal — remplace l'ancienne "finition" (poli/brossé/noirci/plaqué or) pour cet usage :
    // valeurs libres, alimentées par Settings.metalTypes/goldColors (backend-configurable).
    metal: String,
    goldColor: String,
    // Description par IA — cahier des charges 4.4
    aiGenerated: {
      description: { type: Boolean, default: false },
      hashtags: { type: [String], default: [] },
    },
    // Publication réseaux sociaux — cahier des charges 4.5
    socialPostStatus: {
      type: String,
      enum: ["none", "pending", "published", "failed"],
      default: "none",
    },
    socialPostedAt: Date,
    socialPostIds: {
      facebook: String,
      instagram: String,
    },
    socialPostError: String,
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);
export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export const Product: Model<ProductDoc> =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

// Order
const OrderItemSchema = new Schema(
  {
    productId: String,
    name: String,
    flavor: String,
    size: String,
    quantity: { type: Number, min: 1 },
    price: Number,
  },
  { _id: false }
);
const OrderSchema = new Schema(
  {
    client: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    items: [OrderItemSchema],
    total: { type: Number, required: true },
    pickupDate: String,
    slot: String,
    mode: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    address: String,
    note: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    stripeSessionId: String,
    stripePaymentIntent: String,
  },
  { timestamps: true }
);
export type OrderDoc = InferSchemaType<typeof OrderSchema>;
export const Order: Model<OrderDoc> =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

// Settings
const SettingsSchema = new Schema(
  {
    brandName: { type: String, default: () => siteConfig.brand.name },
    brandTagline: { type: String, default: () => siteConfig.brand.tagline },
    heroTitle: { type: String, default: () => siteConfig.hero.defaultTitle },
    heroSubtitle: { type: String, default: () => siteConfig.hero.defaultSubtitle },
    heroImageUrl: { type: String, default: () => siteConfig.hero.defaultImageUrl },
    email: String,
    phone: String,
    zone: String,
    // Affichée en pied de page + carte Google Maps — cahier des charges 4.7. Valeur fictive
    // de départ (quartier des joailliers à Paris), à remplacer par la vraie adresse en
    // Paramètres > Contact ; laisser vide retire l'adresse du pied de page et la carte.
    address: { type: String, default: "14 rue des Orfèvres, 75001 Paris" },
    adminPassword: { type: String, required: true },
    slots: { type: [String], default: () => siteConfig.defaults.slots },
    openWeekdays: { type: [Number], default: () => siteConfig.defaults.openWeekdays },
    closedDates: { type: [String], default: [] },
    minDelay: { type: Number, default: () => siteConfig.defaults.minDelay },
    about: { type: String, default: "" },
    cgv: String,
    rgpd: String,
    cookiesPolicy: String,
    // Réseaux sociaux — cahier des charges 4.5
    socialAutoPublish: { type: Boolean, default: true },
    // Navigation & pied de page — cahier des charges 4.12
    navLinks: {
      type: [{ href: String, label: String, _id: false }],
      default: () => siteConfig.navbar.links,
    },
    socialLinks: {
      type: [
        {
          platform: String,
          url: String,
          active: { type: Boolean, default: true },
          // Affichage aussi dans la barre du haut (en plus du pied de page), coché au cas par cas.
          showInHeader: { type: Boolean, default: false },
          _id: false,
        },
      ],
      default: [],
    },
    // Bandeau défilant du header — annonces, infos, promotions (avec compte à rebours optionnel
    // via expiresAt pour les "chrono promotions"). Vide = repli sur le texte statique du thème.
    announcements: {
      type: [
        {
          text: String,
          link: String,
          expiresAt: Date,
          active: { type: Boolean, default: true },
          _id: false,
        },
      ],
      default: [],
    },
    // Bannière publicitaire page d'accueil — cahier des charges 4.10
    bannerEnabled: { type: Boolean, default: false },
    bannerType: { type: String, enum: ["photo", "video"], default: "photo" },
    bannerSize: { type: String, enum: ["compacte", "standard", "pleine"], default: "standard" },
    bannerUrl: String,
    bannerLink: String,
    // Panneau d'activation des modules — cahier des charges 4.11
    moduleFlags: { type: Map, of: Boolean, default: () => DEFAULT_MODULE_FLAGS },
    // Métaux vendus (argent/or/perles) et couleurs d'or — listes éditables en backend.
    metalTypes: {
      type: [{ key: String, label: String, _id: false }],
      default: () => DEFAULT_METAL_TYPES,
    },
    goldColors: {
      type: [{ key: String, label: String, hex: String, _id: false }],
      default: () => DEFAULT_GOLD_COLORS,
    },
  },
  { timestamps: true, toObject: { flattenMaps: true }, toJSON: { flattenMaps: true } }
);
export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;
export const Settings: Model<SettingsDoc> =
  mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
