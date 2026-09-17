-- Stock + statut auto, métal personnalisé, réduction produit, campagnes Black Friday.
-- Voir le plan de la conversation pour le contexte complet de chaque champ.

alter table products add column if not exists stock integer not null default 0;
alter table products add column if not exists metal_custom text;
alter table products add column if not exists is_promo boolean not null default false;
alter table products add column if not exists discount_pct integer not null default 0
  check (discount_pct between 0 and 100);
alter table products add column if not exists is_blackfriday boolean not null default false;
alter table products add column if not exists promo_ends_at timestamptz;

-- Nouvelle valeur d'statut "on_order" (À commander) — remplace la contrainte existante.
alter table products drop constraint if exists products_status_check;
alter table products add constraint products_status_check
  check (status in ('available', 'unavailable', 'soon', 'pending', 'on_order'));
