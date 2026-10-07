/**
 * Product thumbnail with fallback for products without photos.
 * @param {{ image?: string, alt: string, className?: string }} props
 */
function ProductThumb({ image, alt, className = 'h-11 w-11 rounded-xl' }) {
  if (image) {
    return (
      <img
        src={image}
        alt={alt}
        className={`shrink-0 border border-outline-variant/40 object-cover bg-surface ${className}`}
      />
    )
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center border border-dashed border-outline-variant/70 bg-surface-container-low text-outline ${className}`}
      aria-hidden="true"
    >
      <span className="material-symbols-outlined text-[20px]">image</span>
    </div>
  )
}

export default ProductThumb