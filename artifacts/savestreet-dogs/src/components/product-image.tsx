import { useState } from "react";
import { PawPrint } from "lucide-react";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  fallbackSize?: number;
  eager?: boolean;
  className?: string;
};

/**
 * Product imagery with a graceful fallback.
 *
 * Catalog photos come from the API and can be missing or unreachable; the plain
 * <img> used before this component left a broken-image icon on the page. Now a
 * failed load falls back to the paw mark so a card never looks broken.
 *
 * Photos are never cropped or stretched: the frame keeps a fixed aspect ratio
 * and the image is contained, so a collar is never sliced at the edges.
 */
export function ProductImage({ src, alt, fallbackSize = 34, eager = false, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={`product-image-fallback ${className ?? ""}`.trim()} role="img" aria-label={`${alt} placeholder`}>
        <PawPrint size={fallbackSize} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  );
}
