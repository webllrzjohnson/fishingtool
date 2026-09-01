"use client";

import Image from "next/image";
import { useState } from "react";
import type { SpeciesImage } from "@/lib/types";

type Props = {
  image: SpeciesImage;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function SpeciesIllustration({ image, className = "", priority = false, sizes = "(max-width: 768px) 100vw, 400px" }: Props) {
  const [src, setSrc] = useState(image.localSrc);

  return (
    <Image
      src={src}
      alt={image.alt}
      width={800}
      height={400}
      priority={priority}
      sizes={sizes}
      className={`h-auto w-full object-contain ${className}`}
      onError={() => {
        if (src !== image.remoteSrc) setSrc(image.remoteSrc);
      }}
    />
  );
}
