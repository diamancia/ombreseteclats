import { effectivePrice, type PricedProduct } from "@/lib/pricing";

export default function ProductPrice({ product, className = "" }: { product: PricedProduct; className?: string }) {
  const { price, originalPrice } = effectivePrice(product);
  if (originalPrice == null) {
    return <span className={className}>{price.toFixed(2)}€</span>;
  }
  return (
    <span className={className}>
      <span className="mr-1.5 text-[0.8em] text-gray-400 line-through">{originalPrice.toFixed(2)}€</span>
      <span>{price.toFixed(2)}€</span>
    </span>
  );
}
