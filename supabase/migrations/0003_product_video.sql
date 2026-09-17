-- Vidéo (YouTube ou lien de fichier vidéo direct) affichable sur la fiche produit.
alter table products add column if not exists video_url text;
