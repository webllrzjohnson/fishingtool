import fs from "node:fs";
import path from "node:path";
import { speciesImageCatalog } from "../src/data/curated/species-images";

const outDir = path.join(process.cwd(), "public", "species");
const delayMs = Number(process.env.SPECIES_IMAGE_DELAY_MS ?? 45_000);

async function download(url: string, destination: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "OntarioFishingTool/1.0 (species-image-setup; educational)",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 5_000 || buffer.toString("utf8", 0, 15).includes("<!DOCTYPE")) {
    throw new Error(`Unexpected payload (${buffer.length} bytes)`);
  }
  fs.writeFileSync(destination, buffer);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const entries = Object.entries(speciesImageCatalog);
  console.log(`Downloading ${entries.length} species illustrations (${delayMs}ms between requests)...`);

  for (const [id, image] of entries) {
    const destination = path.join(outDir, `${id}.jpg`);
    if (fs.existsSync(destination) && fs.statSync(destination).size > 5_000) {
      console.log(`skip ${id} (already present)`);
      continue;
    }
    try {
      await download(image.remoteSrc, destination);
      console.log(`ok   ${id}`);
    } catch (error) {
      console.error(`fail ${id}: ${error instanceof Error ? error.message : error}`);
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  console.log("Done. Rebuild or refresh to use bundled /species/*.jpg assets.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
