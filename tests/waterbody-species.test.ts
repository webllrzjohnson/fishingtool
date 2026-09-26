import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifyAraSpecies,
  gameSpeciesWithProfile,
  parseSpeciesSummary,
} from "../src/lib/waterbodies/species-map";

const lakeNipigonSummary =
  "Blackfin Cisco,Blacknose Shiner,Bloater,Brook Stickleback,Brook Trout,Brown Trout,Burbot,Carps and Minnows,Cisco,Coregonus sp.,Deepwater Sculpin,Emerald Shiner,Finescale Dace,Golden Shiner,Iowa Darter,Johnny Darter,Lake Chub,Lake Sturgeon,Lake Trout,Lake Whitefish,Logperch,Longnose Dace,Longnose Sucker,Mottled Sculpin,Ninespine Stickleback,Nipigon Cisco,Northern Pearl Dace,Northern Pike,Northern Redbelly Dace,Rainbow Smelt,River Shiner,Round Whitefish,Sauger,Sculpins,Shorthead Redhorse,Shortjaw Cisco,Shortnose Cisco,Silver Redhorse,Slimy Sculpin,Smallmouth Bass,Spoonhead Sculpin,Spottail Shiner,Sticklebacks,Threespine Stickleback,Trout-Perch,Unidentifiable,Walleye,White Sucker,Whitefish subfamily,Yellow Perch";

describe("ARA species mapping", () => {
  it("maps common game fish to catalog ids", () => {
    assert.equal(classifyAraSpecies("Black Crappie"), "game-with-profile");
    assert.equal(classifyAraSpecies("Northern Pike"), "game-with-profile");
    assert.equal(classifyAraSpecies("Sculpins"), "non-game");
    assert.equal(classifyAraSpecies("Unidentifiable"), "non-game");
  });

  it("partitions the Lake Nipigon species summary", () => {
    const parsed = parseSpeciesSummary(lakeNipigonSummary);
    const profiles = gameSpeciesWithProfile(parsed);
    assert.ok(profiles.some((entry) => entry.catalogSpeciesId === "brook-trout"));
    assert.ok(profiles.some((entry) => entry.catalogSpeciesId === "walleye"));
    assert.ok(parsed.some((entry) => entry.name === "Emerald Shiner" && entry.classification === "non-game"));
  });
});
