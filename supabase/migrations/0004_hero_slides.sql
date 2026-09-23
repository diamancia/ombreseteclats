-- Carrousel Hero (remplace la photo unique par plusieurs, chacune avec son propre bouton CTA).
alter table settings add column if not exists hero_slides jsonb not null default '[]';
alter table settings add column if not exists hero_slides_enabled boolean not null default true;
-- Vitesse de défilement auto (ms) — réglable depuis l'admin. ctaAlign ("left"/"center"/"right")
-- vit dans chaque entrée de hero_slides (jsonb), pas de colonne dédiée nécessaire.
alter table settings add column if not exists hero_slides_interval_ms integer not null default 5000;
