-- Schéma initial — migration depuis MongoDB/Mongoose (src/lib/models.ts).
-- UUID partout (gen_random_uuid()) : le plus proche du comportement actuel où les _id
-- Mongo sont traités comme des chaînes opaques (Stripe metadata.orderId, comparaisons de
-- catégorie sélectionnée en query string, etc.) — minimise les changements côté code.
--
-- RLS activée sur toutes les tables, sans policy : le site n'appelle jamais Supabase depuis
-- le navigateur, tout passe par le serveur Next.js avec la clé service_role (qui bypass RLS).
-- Ça bloque par défaut tout accès via une clé anon qui fuiterait.
--
-- pgcrypto pour gen_random_uuid() — activée par défaut sur les projets Supabase récents,
-- l'extension est déclarée ici par prudence (idempotent).
create extension if not exists pgcrypto;

-- Trigger générique pour updated_at (équivalent de { timestamps: true } côté Mongoose).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------------------
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'custom' check (role in ('admin', 'community_manager', 'vendeur', 'custom')),
  modules text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();
alter table users enable row level security;

-- ---------------------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'system' check (type in ('order', 'system')),
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notifications_created_at_idx on notifications (created_at desc);
create index notifications_read_idx on notifications (read) where read = false;
create trigger notifications_set_updated_at before update on notifications
  for each row execute function set_updated_at();
alter table notifications enable row level security;

-- ---------------------------------------------------------------------------------------
-- categories (auto-référence pour parent, comme Category.parent -> Category)
-- ---------------------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '',
  image_url text not null default '',
  active boolean not null default true,
  gender text check (gender in ('homme', 'femme', 'mixte')),
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_parent_idx on categories (parent_id);
create trigger categories_set_updated_at before update on categories
  for each row execute function set_updated_at();
alter table categories enable row level security;

-- ---------------------------------------------------------------------------------------
-- products
-- flavors/sizes/stone/custom_length/ai_generated/social_post_ids en jsonb : tableaux
-- embarqués jamais référencés par sous-id ailleurs dans le code (confirmé par l'audit) —
-- pas besoin de tables enfants.
-- ---------------------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_desc text,
  long_desc text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  delay integer not null default 2,
  is_new boolean not null default false,
  status text not null default 'available' check (status in ('available', 'unavailable', 'soon', 'pending')),
  image_url text,
  images text[] not null default '{}',
  allergens text,
  category_id uuid references categories(id) on delete set null,
  gender text not null default 'homme' check (gender in ('homme', 'femme', 'enfant', 'mixte')),
  flavors jsonb not null default '[]',
  sizes jsonb not null default '[]',
  custom_length jsonb not null default '{"enabled": false, "presets": [39, 42], "minCm": 30, "maxCm": 70}',
  jewelry_type text check (jewelry_type in (
    'bague', 'bracelet', 'collier', 'gourmette_cheville', 'boucle_oreille',
    'ceinture_traditionnelle', 'broche', 'perles', 'cordon'
  )),
  dimension_value text,
  stone jsonb,
  metal text,
  gold_color text,
  ai_generated jsonb not null default '{"description": false, "hashtags": []}',
  social_post_status text not null default 'none' check (social_post_status in ('none', 'pending', 'published', 'failed')),
  social_posted_at timestamptz,
  social_post_ids jsonb not null default '{}',
  social_post_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on products (category_id);
create index products_created_at_idx on products (created_at desc);
create index products_status_idx on products (status);
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();
alter table products enable row level security;

-- ---------------------------------------------------------------------------------------
-- orders
-- items en jsonb, exactement comme aujourd'hui : Order.items[].productId est une chaîne
-- libre côté Mongoose (jamais de populate/FK dessus) — reproduit à l'identique plutôt que
-- d'introduire une contrainte relationnelle qui n'existe pas dans le comportement actuel.
-- ---------------------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  email text not null,
  phone text,
  items jsonb not null default '[]',
  total numeric(10, 2) not null,
  pickup_date text,
  slot text,
  mode text not null default 'pickup' check (mode in ('pickup', 'delivery')),
  address text,
  note text,
  attachment_url text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'ready', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded', 'failed')),
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_at_idx on orders (created_at desc);
create index orders_status_idx on orders (status);
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();
alter table orders enable row level security;

-- ---------------------------------------------------------------------------------------
-- settings — singleton (une seule ligne, id fixe connu). Plus robuste que la convention
-- "premier document trouvé" de Mongoose : la contrainte primary key sur un id constant
-- empêche physiquement une deuxième ligne d'exister.
-- module_flags remplace le type Map de Mongoose (Settings.moduleFlags) : jsonb est déjà un
-- objet plain à la lecture, le flattening manuel (toObject/toJSON flattenMaps) devient inutile.
-- ---------------------------------------------------------------------------------------
create table settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid
    check (id = '00000000-0000-0000-0000-000000000001'::uuid),
  brand_name text,
  brand_tagline text,
  hero_title text,
  hero_subtitle text,
  hero_image_url text,
  email text,
  phone text,
  zone text,
  address text default '14 rue des Orfèvres, 75001 Paris',
  admin_password text not null,
  slots text[] not null default '{}',
  open_weekdays integer[] not null default '{1,2,3,4,5,6}',
  closed_dates text[] not null default '{}',
  min_delay integer,
  about text,
  cgv text,
  rgpd text,
  cookies_policy text,
  social_auto_publish boolean not null default true,
  nav_links jsonb not null default '[]',
  social_links jsonb not null default '[]',
  announcements jsonb not null default '[]',
  banner_enabled boolean not null default false,
  banner_type text not null default 'photo' check (banner_type in ('photo', 'video')),
  banner_size text not null default 'standard' check (banner_size in ('compacte', 'standard', 'pleine')),
  banner_url text,
  banner_link text,
  module_flags jsonb not null default '{}',
  metal_types jsonb not null default '[]',
  gold_colors jsonb not null default '[]',
  chain_length_pricing jsonb not null default '{"refCm": 40, "pricePerCm": 5}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger settings_set_updated_at before update on settings
  for each row execute function set_updated_at();
alter table settings enable row level security;

-- ---------------------------------------------------------------------------------------
-- landing_pages
-- ---------------------------------------------------------------------------------------
create table landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  product_name text not null,
  kicker text not null default '',
  tagline text not null default '',
  images text[] not null default '{}',
  price_original numeric(10, 2) not null,
  price_current numeric(10, 2) not null,
  specs jsonb not null default '[]',
  cta_label text not null default 'Acheter maintenant',
  cta_link text not null default '/sur-mesure',
  start_at timestamptz,
  end_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger landing_pages_set_updated_at before update on landing_pages
  for each row execute function set_updated_at();
alter table landing_pages enable row level security;

-- ---------------------------------------------------------------------------------------
-- google_reviews_cache — singleton, même pattern id fixe que settings.
-- ---------------------------------------------------------------------------------------
create table google_reviews_cache (
  id uuid primary key default '00000000-0000-0000-0000-000000000002'::uuid
    check (id = '00000000-0000-0000-0000-000000000002'::uuid),
  rating numeric(2, 1),
  total_reviews integer,
  reviews jsonb not null default '[]',
  fetched_at timestamptz not null default now()
);
alter table google_reviews_cache enable row level security;
