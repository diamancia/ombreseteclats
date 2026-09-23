"use client";
import { useState } from "react";
import Link from "next/link";
import { ZoomIn } from "lucide-react";
import AddToCartButton from "./AddToCartButton";
import ProductBadges, { ProductSecondaryBadge } from "./ProductBadges";
import ProductPrice from "./ProductPrice";
import ImageLightbox from "./ImageLightbox";

export default function ProductCard({ product }: { product: any }) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const gallery = ([product.imageUrl, ...(product.images || [])].filter(Boolean) as string[]).filter(
    (url, i, arr) => arr.indexOf(url) === i
  );

  return (
    <article className="group relative overflow-hidden rounded-lg bg-[var(--muted)] shadow-sm transition-shadow hover:shadow-lg">
      <ProductBadges product={product} />
      <Link href={`/produit/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-[var(--accent)] to-white">
          {product.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🍰</div>
          )}
        </div>
      </Link>
      {product.imageUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setZoomOpen(true);
          }}
          aria-label="Zoomer sur la photo"
          className="absolute right-2 top-2 rounded-full bg-black/40 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      )}
      <div className="p-3">
        <ProductSecondaryBadge product={product} className="mb-1.5" />
        <Link href={`/produit/${product._id}`}>
          <h3 className="line-clamp-2 text-xs font-medium hover:text-[var(--primary)]">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <ProductPrice product={product} className="text-sm font-semibold" />
          <AddToCartButton product={product} />
        </div>
      </div>

      {zoomOpen && <ImageLightbox images={gallery} alt={product.name} onClose={() => setZoomOpen(false)} />}
    </article>
  );
}
