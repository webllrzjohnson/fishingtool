import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { commonSpecies } from "@/data/curated/species";
import { tacklePhoto, tacklePhotos } from "@/data/curated/tackle-photos";
import { generatedTackleImage, generatedTackleImages } from "@/data/curated/tackle-generated";
import { tackleTargets } from "@/data/curated/tackle-targets";
import { filterTackleCatalog, tackleCatalog, tackleCategories } from "@/lib/tackle-catalog";
import { baitFamilyByName, baitRuleWarning, familyForBait, guideForFamily, reelSetupsForSpecies, reelTypes, tackleFamilies, tackleImage } from "@/data/curated/tackle-reference";

const asset = (src: string) => join(process.cwd(), "public", src.replace(/^\//, ""));

test("all 18 species and every curated bait option have a mapped, real illustration", () => {
  assert.equal(commonSpecies.length, 18);
  const names = new Set<string>();
  for (const species of commonSpecies) {
    assert.ok(species.baits.length > 0, species.id);
    for (const bait of species.baits) {
      names.add(bait.name);
      const family = familyForBait(bait.name);
      assert.ok(family, `${species.id}: ${bait.name}`);
      assert.ok(tackleFamilies.some((item) => item.id === family));
      assert.ok(existsSync(asset(tackleImage(family!))), bait.name);
      assert.ok(bait.technique);
    }
    assert.ok(reelSetupsForSpecies(species.id).length, species.id);
  }
  assert.deepEqual(Object.keys(baitFamilyByName).sort(), [...names].sort(), "remove obsolete mappings");
});

test("all pictured families and reel mechanisms have descriptive original SVG assets", () => {
  assert.equal(tackleFamilies.length, 30);
  assert.equal(reelTypes.length, 7);
  for (const item of tackleFamilies) {
    assert.ok(item.caption.length > 35, item.id);
    const svg = readFileSync(asset(tackleImage(item.id)), "utf8");
    assert.match(svg, /<svg[^>]+viewBox=/);
    assert.match(svg, /<(path|ellipse|circle)/);
    assert.ok(svg.length > 350, item.id);
  }
  for (const item of reelTypes) {
    assert.ok(item.classNote && item.line && item.source.startsWith("https://"));
    const svg = readFileSync(asset(`/tackle/reel-${item.id}.svg`), "utf8");
    assert.match(svg, /<svg[^>]+viewBox=/);
    assert.match(svg, /<(path|circle|rect)/);
  }
});

test("photographs are local, attributed and licensed with explicit fallback", () => {
  assert.equal(Object.keys(tacklePhotos).length, 0);
  const ids = new Set<string>([...tackleFamilies.map((item) => item.id), ...reelTypes.map((item) => `reel-${item.id}`)]);
  for (const [id, photo] of Object.entries(tacklePhotos)) {
    assert.ok(ids.has(id), id);
    const resolved = tacklePhoto(id)!;
    assert.ok(existsSync(asset(resolved.src)), id);
    const bytes = readFileSync(asset(resolved.src));
    assert.ok(bytes.length > 10000, id);
    assert.ok(bytes.subarray(0, 3).toString("hex") === "ffd8ff" || bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a", id);
    assert.ok(photo.creator && photo.subject && photo.license, id);
    assert.match(resolved.sourceUrl, /^https:\/\/(?:commons\.wikimedia\.org\/wiki\/File:|www\.flickr\.com\/photos\/)/);
    assert.match(resolved.licenseUrl, /^https:\/\//);
  }
  for (const id of ids) assert.ok(existsSync(asset(tacklePhoto(id)?.src ?? `/tackle/${id}.svg`)), id);
  for (const id of ["roe-bead", "ned", "tube-ned", "worm-harness", "worm-float", "reel-line-counter", "reel-spinning", "reel-baitcasting", "reel-spincast", "reel-fly", "reel-centerpin", "reel-ice"]) assert.equal(tacklePhoto(id), undefined, id);
  assert.equal(tacklePhoto("jig"), undefined);
  assert.equal(tacklePhoto("swimbait"), undefined);
  assert.equal(tacklePhoto("worm-plastic"), undefined);
  assert.equal(tacklePhoto("drop-shot"), undefined);
  assert.equal(tacklePhoto("crankbait"), undefined);
  assert.equal(tacklePhoto("jerkbait"), undefined);
  assert.equal(tacklePhoto("spoon"), undefined);
  assert.equal(tacklePhoto("maggot"), undefined);
  assert.equal(tacklePhoto("boilie"), undefined);
  assert.equal(tacklePhoto("corn"), undefined);
  assert.equal(tacklePhoto("bottom-worm"), undefined);
  assert.equal(tacklePhoto("jigging-spoon"), undefined);
  assert.equal(tacklePhoto("spinnerbait"), undefined);
  assert.equal(tacklePhoto("inline-spinner"), undefined);
  assert.equal(tacklePhoto("bucktail"), undefined);
  assert.equal(tacklePhoto("topwater"), undefined);
  assert.equal(tacklePhoto("fly"), undefined);
  assert.equal(tacklePhoto("bead-nymph"), undefined);
  assert.equal(tacklePhoto("dry-fly"), undefined);
  assert.equal(generatedTackleImage("worm-float")!.src, "/tackle/generated/worm-float.png");
  assert.equal(tacklePhoto("bottom-rig"), undefined);

  const picture = readFileSync(join(process.cwd(), "src/components/tackle/tackle-picture.tsx"), "utf8");
  assert.match(picture, /photo\.sourceUrl/);
  assert.match(picture, /photo\.licenseUrl/);
  assert.match(picture, /Original schematic · not to scale/);
  assert.match(picture, /photo\.creator/);
  for (const file of ["src/components/tackle/tackle-catalog.tsx", "src/app/tackle/reels/page.tsx", "src/app/species/[slug]/page.tsx"]) {
    assert.match(readFileSync(join(process.cwd(), file), "utf8"), /<TacklePicture/);
  }
});

test("all generated infographics are local, distinguished from photos and individually screened", () => {
  assert.equal(Object.keys(generatedTackleImages).length, 37);
  const ids = new Set<string>([...tackleFamilies.map((family) => family.id), ...reelTypes.map((reel) => `reel-${reel.id}`)]);
  for (const [id, image] of Object.entries(generatedTackleImages)) {
    assert.ok(ids.has(id), id);
    assert.equal(tacklePhoto(id), undefined, `${id} must not mask a credited photograph`);
    assert.ok(image.subject && image.caveat, id);
    const bytes = readFileSync(asset(generatedTackleImage(id)!.src));
    assert.ok(bytes.length > 10000, id);
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", id);
  }
  assert.match(generatedTackleImage("worm-plastic")!.caveat, /lightly skin-hook the point/);
  assert.match(generatedTackleImage("drop-shot")!.caveat, /same line/);
  assert.ok(readFileSync(asset(generatedTackleImage("drop-shot")!.src)).length > 500_000);
  assert.match(generatedTackleImage("crankbait")!.caveat, /line-tie eye/);
  assert.ok(readFileSync(asset(generatedTackleImage("crankbait")!.src)).length > 500_000);
  assert.match(generatedTackleImage("jerkbait")!.caveat, /only suspending models/);
  assert.ok(readFileSync(asset(generatedTackleImage("jerkbait")!.src)).length > 500_000);
  assert.match(generatedTackleImage("spoon")!.caveat, /side-to-side wobble/);
  assert.ok(readFileSync(asset(generatedTackleImage("spoon")!.src)).length > 500_000);
  assert.match(generatedTackleImage("jigging-spoon")!.caveat, /ice safety independently/);
  assert.ok(readFileSync(asset(generatedTackleImage("jigging-spoon")!.src)).length > 500_000);
  assert.match(generatedTackleImage("spinnerbait")!.caveat, /upper wire bend/);
  assert.ok(readFileSync(asset(generatedTackleImage("spinnerbait")!.src)).length > 500_000);
  assert.match(generatedTackleImage("inline-spinner")!.caveat, /front eye/);
  assert.ok(readFileSync(asset(generatedTackleImage("inline-spinner")!.src)).length > 500_000);
  assert.match(generatedTackleImage("bucktail")!.caveat, /not a universal requirement/);
  assert.ok(readFileSync(asset(generatedTackleImage("bucktail")!.src)).length > 500_000);
  assert.match(generatedTackleImage("topwater")!.caveat, /front nose eye/);
  assert.ok(readFileSync(asset(generatedTackleImage("topwater")!.src)).length > 500_000);
  assert.match(generatedTackleImage("fly")!.caveat, /hook eye/);
  assert.ok(readFileSync(asset(generatedTackleImage("fly")!.src)).length > 500_000);
  assert.match(generatedTackleImage("bead-nymph")!.caveat, /fixed at the dressed nymph's hook eye/);
  assert.ok(readFileSync(asset(generatedTackleImage("bead-nymph")!.src)).length > 500_000);
  assert.match(generatedTackleImage("dry-fly")!.caveat, /drag-free drift/);
  assert.ok(readFileSync(asset(generatedTackleImage("dry-fly")!.src)).length > 500_000);
  assert.match(generatedTackleImage("maggot")!.caveat, /ice safety independently/);
  assert.ok(readFileSync(asset(generatedTackleImage("maggot")!.src)).length > 500_000);
  assert.match(generatedTackleImage("corn")!.caveat, /natural corn kernels/);
  assert.ok(readFileSync(asset(generatedTackleImage("corn")!.src)).length > 500_000);
  assert.match(generatedTackleImage("bottom-worm")!.caveat, /real worm/);
  assert.ok(readFileSync(asset(generatedTackleImage("bottom-worm")!.src)).length > 500_000);
  assert.match(generatedTackleImage("boilie")!.caveat, /separate hair/);
  assert.ok(readFileSync(asset(generatedTackleImage("boilie")!.src)).length > 500_000);
  assert.match(generatedTackleImage("bottom-rig")!.caveat, /free-sliding sinker/);
  assert.ok(readFileSync(asset(generatedTackleImage("bottom-rig")!.src)).length > 500_000);
  assert.doesNotMatch(readFileSync(join(process.cwd(), "src/components/tackle/tackle-picture.tsx"), "utf8"), /AI illustration only|depicted hook path and step 2 are misleading/);
  for (const id of ["jig", "swimbait"]) {
    assert.match(generatedTackleImage(id)!.subject, /Watermarked full/);
    assert.match(generatedTackleImage(id)!.caveat, /thread|Thread/);
    assert.ok(readFileSync(asset(generatedTackleImage(id)!.src)).length > 500_000);
  }
  assert.ok(readFileSync(asset(generatedTackleImage("worm-harness")!.src)).length > 2_000_000);
  assert.match(generatedTackleImage("stink-bait")!.subject, /prepared stink-bait/);
  assert.match(generatedTackleImage("stink-bait")!.caveat, /product directions/);
  assert.ok(readFileSync(asset(generatedTackleImage("stink-bait")!.src)).length > 2_000_000);
  assert.match(generatedTackleImage("roe-bead")!.subject, /separate pegged bead/);
  assert.match(generatedTackleImage("roe-bead")!.caveat, /not automatically an artificial fly/);
  assert.ok(readFileSync(asset(generatedTackleImage("roe-bead")!.src)).length > 2_000_000);
  assert.match(generatedTackleImage("reel-line-counter")!.subject, /conventional line-counter trolling reel/);
  assert.match(generatedTackleImage("reel-line-counter")!.caveat, /never exact lure depth/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-line-counter")!.src)).length > 2_000_000);
  assert.match(generatedTackleImage("reel-baitcasting")!.subject, /low-profile baitcasting reel/);
  assert.match(generatedTackleImage("reel-baitcasting")!.caveat, /star drag and side brake dial/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-baitcasting")!.src)).length > 2_000_000);
  assert.match(generatedTackleImage("reel-spincast")!.subject, /closed-face spincast reel/);
  assert.match(generatedTackleImage("reel-spincast")!.caveat, /rear thumb button/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-spincast")!.src)).length > 1_500_000);
  assert.match(generatedTackleImage("reel-fly")!.subject, /large-arbor fly reel/);
  assert.match(generatedTackleImage("reel-fly")!.caveat, /Match a fly reel/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-fly")!.src)).length > 1_500_000);
  assert.match(generatedTackleImage("reel-centerpin")!.subject, /specialist centerpin/);
  assert.match(generatedTackleImage("reel-centerpin")!.caveat, /no bail, crank handle or line counter/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-centerpin")!.src)).length > 1_500_000);
  assert.match(generatedTackleImage("reel-spinning")!.subject, /front-drag spinning reel/);
  assert.match(generatedTackleImage("reel-spinning")!.caveat, /fixed front-drag spool/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-spinning")!.src)).length > 1_500_000);
  assert.match(generatedTackleImage("reel-ice")!.subject, /inline ice reel/);
  assert.match(generatedTackleImage("reel-ice")!.caveat, /alternative to an ice spinning reel/);
  assert.ok(readFileSync(asset(generatedTackleImage("reel-ice")!.src)).length > 2_000_000);
  const picture = readFileSync(join(process.cwd(), "src/components/tackle/tackle-picture.tsx"), "utf8");
  assert.match(picture, /AI-generated guide/);
  assert.match(picture, /generated\.caveat/);
  assert.match(picture, /Rigging &amp; safety notes/);
  assert.match(picture, /Open full-size/);
});

test("shore/ice/boat and specialist pairings remain distinct", () => {
  const pike = reelSetupsForSpecies("northern-pike");
  assert.equal(pike[0].id, "pike-cover-spinning");
  assert.match(pike[0].line.leader!, /Wire/);
  assert.ok(pike.some((item) => item.category === "ice"));
  assert.ok(!pike.some((item) => item.id === "general-shore-spinning"));
  assert.equal(reelSetupsForSpecies("walleye")[0].speciesIds.includes("northern-pike"), false);
  const muskie = reelSetupsForSpecies("muskellunge");
  assert.equal(muskie.length, 1);
  assert.match(muskie[0].line.mainLine, /80–100 lb/);
  assert.deepEqual(muskie[0].reel.types, ["baitcasting"]);
  assert.doesNotMatch(muskie[0].rod.lineRatingRange!, /equivalent/);
  const salmon = reelSetupsForSpecies("pacific-salmon");
  assert.ok(salmon.some((item) => item.id === "salmon-steelhead-shore"));
  assert.ok(salmon.some((item) => item.id === "trolling-line-counter"));
  assert.equal(reelSetupsForSpecies("carp")[0].id, "carp-catfish-bait");
  assert.equal(reelSetupsForSpecies("rainbow-trout")[0].id, "stocked-pond-trout");
  assert.ok(reelSetupsForSpecies("rainbow-trout").some((item) => item.id === "fly-steelhead-salmon"));
  assert.ok(!reelSetupsForSpecies("pacific-salmon").some((item) => item.id === "fly-trout"));
  assert.deepEqual(reelSetupsForSpecies("lake-trout")[1].reel.types, ["line-counter"]);
  assert.match(reelSetupsForSpecies("lake-trout")[0].rod.actionNotes, /spinning rod/);
  assert.equal(familyForBait("Worm harness"), "worm-harness");
  assert.equal(familyForBait("Bucktail spinner"), "bucktail");
  assert.equal(familyForBait("Drop-shot"), "drop-shot");
  for (const [speciesId, shoreId, alternate] of [["lake-trout", "lake-trout-shore", "trolling-line-counter"], ["lake-whitefish", "whitefish-shore", "ice-walleye-pike"]]) {
    const setups = reelSetupsForSpecies(speciesId);
    assert.equal(setups[0].id, shoreId);
    assert.equal(setups[0].category, "shore-spinning");
    assert.match(setups[0].summary, /shore|summer/i);
    assert.ok(setups.some((item) => item.id === alternate));
  }
});

test("bait warnings distinguish baitfish from other natural bait and artificial flies", () => {
  assert.match(baitRuleWarning("Small minnow", "natural")!, /bait-management-zone/);
  assert.match(baitRuleWarning("Cut bait", "natural")!, /baitfish species/);
  for (const name of ["Worm", "Worm harness", "Maggot", "Boilie-style bait"]) {
    assert.doesNotMatch(baitRuleWarning(name, "natural")!, /Verify permitted baitfish species/);
  }
  assert.match(baitRuleWarning("Roe-imitation bead", "artificial")!, /not automatically an artificial fly/);
  assert.equal(baitRuleWarning("Bead-head nymph", "artificial"), undefined);
});

test("compound alternatives are split and depicted by their own family", () => {
  for (const species of commonSpecies) for (const bait of species.baits) {
    assert.doesNotMatch(bait.name, /\sor\s/i, `${species.id}: ${bait.name}`);
  }
  for (const [name, family] of Object.entries({
    "Small inline spinner": "inline-spinner", "Small spoon": "spoon", "Small crankbait": "crankbait",
    "Dry fly": "dry-fly", "Bead-head nymph": "bead-nymph", "Roe-imitation bead": "roe-bead",
    "Large soft rubber": "soft-rubber", "Large jerkbait": "jerkbait", "Maggot": "maggot", "Small minnow": "minnow-float",
    "Corn": "corn", "Dough bait": "dough-bait", "Boilie-style bait": "boilie",
    "Cut bait": "cut-bait", "Worm on bottom rig": "bottom-worm", "Stink bait": "stink-bait",
  })) assert.equal(familyForBait(name), family, name);
  for (const name of ["Small spoon or spinner", "Small crankbait or spoon", "Dry fly or nymph", "Bead or nymph", "Large jerkbait or rubber", "Minnow or maggot"]) {
    assert.equal(familyForBait(name), undefined, name);
  }
});

test("family guide uses curated sizes, techniques and target links, with natural bait caution", () => {
  for (const family of tackleFamilies) {
    const guide = guideForFamily(family.id);
    for (const item of guide.examples) {
      assert.ok(commonSpecies.some((species) => species.id === item.speciesId && species.baits.includes(item.bait)), family.id);
      assert.ok(item.bait.technique, family.id);
    }
    for (const size of guide.sizes) assert.ok(guide.examples.some(({ bait }) => bait.sizes === size), family.id);
    if (guide.examples.some(({ bait }) => bait.kind === "natural")) assert.equal(guide.natural, true, family.id);
  }
  assert.ok(guideForFamily("spoon").examples.some((item) => item.speciesId === "lake-trout"));
  assert.deepEqual(guideForFamily("maggot").examples.map((item) => item.speciesId), ["yellow-perch", "crappie", "bluegill"]);
  assert.deepEqual(guideForFamily("dry-fly").sizes, []);
});

test("catalog covers every family once and filters by category, target, size and technique", () => {
  assert.deepEqual(tackleCatalog.map((item) => item.id), tackleFamilies.map((item) => item.id));
  const categoryIds = tackleCategories.filter((item) => item.id !== "all").map((item) => item.id);
  assert.deepEqual([...new Set(tackleCatalog.map((item) => item.category))].sort(), categoryIds.sort());
  assert.equal(categoryIds.reduce((count, id) => count + filterTackleCatalog(tackleCatalog, "", id).length, 0), tackleFamilies.length);
  assert.deepEqual(filterTackleCatalog(tackleCatalog, "  PADDLE tail ", "all").map((item) => item.id), ["swimbait", "soft-rubber"]);
  assert.ok(filterTackleCatalog(tackleCatalog, "walleye", "all").some((item) => item.id === "swimbait"));
  assert.ok(filterTackleCatalog(tackleCatalog, "muskellunge", "all").some((item) => item.id === "topwater"));
  assert.ok(filterTackleCatalog(tackleCatalog, "carp", "all").some((item) => item.id === "bottom-rig"));
  assert.deepEqual(filterTackleCatalog(tackleCatalog, "boilie", "flies"), []);
  assert.deepEqual(filterTackleCatalog(tackleCatalog, "nonsense", "all"), []);
  for (const item of tackleCatalog) {
    assert.ok(item.summary.length > 15, item.id);
    assert.equal(item.natural, guideForFamily(item.id).natural, item.id);
    assert.deepEqual(item.sizes, guideForFamily(item.id).sizes, item.id);
  }
});

test("researched possible targets cover all families with evidence and scale cautions", () => {
  assert.deepEqual(Object.keys(tackleTargets).sort(), tackleFamilies.map((family) => family.id).sort());
  const known = new Set(commonSpecies.map((species) => species.id));
  for (const item of tackleCatalog) {
    const research = tackleTargets[item.id];
    assert.ok(research.ids.length > 0, item.id);
    assert.equal(new Set(research.ids).size, research.ids.length, `${item.id}: duplicate target`);
    for (const id of research.ids) assert.ok(known.has(id), `${item.id}: unknown target ${id}`);
    for (const url of research.sources) assert.match(url, /^https:\/\/[^\s/]+\//, `${item.id}: evidence URL`);
    assert.ok(research.note.length > 20, item.id);
    assert.deepEqual(item.targets.map((target) => target.id), [...research.ids], item.id);
  }
  assert.deepEqual(tackleTargets["bottom-rig"].ids, ["carp", "channel-catfish", "yellow-perch"]);
  assert.ok(tackleTargets["jigging-spoon"].ids.includes("walleye"));
  assert.ok(tackleTargets["inline-spinner"].ids.includes("northern-pike"));
  assert.ok(tackleTargets["topwater"].ids.includes("muskellunge"));
  assert.deepEqual(tackleTargets.maggot.ids, ["yellow-perch", "crappie", "bluegill"]);
  assert.ok(tackleTargets["minnow-float"].ids.includes("lake-whitefish"));
  assert.match(tackleTargets["minnow-float"].note, /not this float method/);
  assert.ok(tackleTargets.jig.sources.includes("https://www.ontario.ca/page/brook-trout"));
  for (const slug of ["yellow-perch", "rainbow-trout", "brook-trout", "brown-trout", "muskellunge", "rock-bass", "pumpkinseed", "chinook-salmon", "coho-salmon"]) {
    assert.ok(tackleTargets["inline-spinner"].sources.includes(`https://www.ontario.ca/page/${slug}`), slug);
  }
  assert.match(readFileSync(join(process.cwd(), "src/components/tackle/tackle-catalog.tsx"), "utf8"), /Possible targets:|All possible targets:|Target sources:/);
});

test("catalog requests intact WebP previews lazily but keeps original full-size PNG and caveats", () => {
  const picture = readFileSync(join(process.cwd(), "src/components/tackle/tackle-picture.tsx"), "utf8");
  const catalog = readFileSync(join(process.cwd(), "src/components/tackle/tackle-catalog.tsx"), "utf8");
  assert.match(picture, /\/tackle\/previews\/\$\{id\}\.webp/);
  assert.match(picture, /href=\{src\}/);
  assert.match(picture, /object-contain/);
  assert.match(picture, /loading="lazy" decoding="async"/);
  assert.match(picture, /generated\.caveat/);
  assert.match(catalog, /preview \/>/);
  assert.match(catalog, /Check bait rules/);
  assert.match(catalog, /Check method rules/);
  assert.match(catalog, /Starting size:/);
  assert.match(catalog, /Example technique:/);
  assert.match(catalog, /aria-live="polite"/);
  assert.match(catalog, /aria-label=\{`\$\{sourceLabel\(url\)\} — \$\{item\.title\} source/);
  assert.match(readFileSync(join(process.cwd(), "src/app/tackle/page.tsx"), "utf8"), /<TackleCatalog items=\{tackleCatalog\}/);
  for (const item of tackleCatalog) {
    const preview = readFileSync(asset(`/tackle/previews/${item.id}.webp`));
    const original = readFileSync(asset(generatedTackleImage(item.id)!.src));
    assert.equal(preview.toString("ascii", 0, 4), "RIFF", item.id);
    assert.equal(preview.toString("ascii", 8, 12), "WEBP", item.id);
    assert.ok(preview.length < original.length, `${item.id}: preview must be lighter than original`);
  }
});
