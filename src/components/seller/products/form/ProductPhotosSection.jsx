import SectionCard from './SectionCard'

const MAX_PHOTOS = 5

/**
 * Product Photos: 1-5 photos with local preview only (mock; replaced by the
 * upload API later). The first photo is the main photo.
 * @param {{
 *   form: object,
 *   errors: Record<string, string>,
 *   addImage: (url: string) => void,
 *   removeImage: (index: number) => void,
 *   setPrimaryImage: (index: number) => void,
 * }} props
 */
function ProductPhotosSection({ form, errors, addImage, removeImage, setPrimaryImage }) {
  const images = form.images || []
  const photoCount = images.length

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (file) {
      addImage(URL.createObjectURL(file))
    }
    event.target.value = ''
  }

  return (
    <SectionCard
      icon="photo_library"
      title={
        <>
          Foto Produk <span className="text-error">*</span>
        </>
      }
      subtitle="Maksimal 5 foto. Foto pertama menjadi foto utama."
      actions={
        <span className="rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-bold text-secondary">
          {photoCount} / 5 Foto
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl border-2 border-outline-variant/60 bg-surface"
            data-error={Boolean(index === 0 && errors.photos)}
          >
            <img
              src={image}
              alt={`Foto produk ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === 0 ? (
              <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary shadow-sm">
                Foto Utama
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setPrimaryImage(index)}
                className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                title="Jadikan foto utama"
              >
                Utama
              </button>
            )}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded bg-white/90 text-on-surface opacity-0 shadow-sm transition-all hover:bg-error hover:text-on-error group-hover:opacity-100"
              aria-label={`Hapus foto ${index + 1}`}
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                delete
              </span>
            </button>
          </div>
        ))}

        {photoCount < MAX_PHOTOS ? (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-outline-variant p-3 text-center transition-all hover:border-primary hover:bg-surface-container-low">
            <span
              className="material-symbols-outlined text-2xl text-primary"
              aria-hidden="true"
            >
              add
            </span>
            <span className="text-xs font-bold text-primary">+ Tambah Foto</span>
            <span className="text-[10px] text-secondary">JPG, PNG</span>
            <input
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>
        ) : null}
      </div>

      {errors.photos ? (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-error">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            error
          </span>
          {errors.photos}
        </p>
      ) : null}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-outline">
        <span className="material-symbols-outlined text-sm" aria-hidden="true">
          info
        </span>
        Preview lokal untuk pengembangan. Mengunggah file akan dihubungkan ke API saat tersedia.
      </p>
    </SectionCard>
  )
}

export default ProductPhotosSection