import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ontario Fishing Tool",
    short_name: "Fishing Tool",
    description: "Plan Ontario fishing trips with locations, species, bait, weather, access, and rules.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#115e59",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
