import Image from "next/image";
import type { SpeciesImage } from "@/lib/types";

type Props = {
  image: SpeciesImage;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function SpeciesIllustration({ image, className = "", priority = false, sizes = "(max-width: 768px) 100vw, 400px" }: Props) {
  const src = image.kind === "ai-generated" || image.kind === "owner-photo" ? image.src : image.localSrc;

  return (
    <figure>
      <Image
        src={src}
        alt={image.alt}
        width={800}
        height={400}
        priority={priority}
        sizes={sizes}
        className={`h-auto w-full object-contain ${className}`}
      />
      {image.kind === "ai-generated" ? (
        <figcaption className="mt-2 text-xs leading-5 text-slate-500">AI-generated illustration · {image.watermark} watermark · not a photograph · {image.caveat}</figcaption>
      ) : image.kind === "owner-photo" ? (
        <figcaption className="mt-2 text-xs leading-5 text-slate-500">Photo by {image.photographer}</figcaption>
      ) : (
        <figcaption className="mt-2 text-xs leading-5 text-slate-500">{image.alt} · {image.credit} · <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Source</a> · {image.license}</figcaption>
      )}
    </figure>
  );
}
