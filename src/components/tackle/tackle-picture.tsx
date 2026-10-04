import { tacklePhoto } from "@/data/curated/tackle-photos";
import { generatedTackleImage } from "@/data/curated/tackle-generated";

export function TacklePicture({ id, title, compact = false, preview = false }: { id: string; title: string; compact?: boolean; preview?: boolean }) {
  const photo = tacklePhoto(id);
  const generated = generatedTackleImage(id);
  const src = photo?.src ?? generated?.src ?? `/tackle/${id}.svg`;
  // Catalog previews show the whole guide; the full-resolution project PNG remains linked.
  const displaySrc = preview && generated ? `/tackle/previews/${id}.webp` : src;
  const imageType = photo ? "photograph" : generated ? "AI-generated infographic" : "schematic";
  return <figure className="bg-[#edf5f2]">
    {/* Local curated images; no remote image request. */}
    <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`Open full-size ${title} ${imageType}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={displaySrc} alt={photo ? `${photo.subject} — representative photograph for ${title}` : generated ? `${generated.subject} — AI-generated infographic for ${title}, not a photograph` : `${title} — original schematic illustration, not a photograph`} width={400} height={280} loading="lazy" decoding="async" className={`w-full object-contain ${generated ? "h-auto" : id === "drop-shot" && photo ? "h-[420px]" : "aspect-[10/7]"}`} />
    </a>
    <figcaption className={`px-3 py-2 text-xs leading-5 text-slate-600 ${compact ? "" : "border-b border-slate-100"}`}>
      {photo ? <>Photograph · {photo.creator} · <a className="underline" href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">Source ↗</a> · <a className="underline" href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license} ↗</a></> : generated ? <>AI-generated guide · <a className="font-semibold underline" href={generated.src} target="_blank" rel="noopener noreferrer">Open full-size ↗</a></> : <>Original schematic · not to scale</>}
      {generated ? <details className="mt-2 border-t border-slate-200 pt-2 text-slate-700">
        <summary className="cursor-pointer font-semibold text-teal-900">Rigging &amp; safety notes</summary>
        <p className="mt-2">{generated.caveat}</p>
      </details> : null}
    </figcaption>
  </figure>;
}
