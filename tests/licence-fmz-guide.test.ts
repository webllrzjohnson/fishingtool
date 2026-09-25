import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FMZ_NUMBERS, licenceFmzGuideLinks } from "../src/lib/regulations/licence-fmz-guide";

describe("licence and FMZ education", () => {
  it("covers each of Ontario's 20 Fisheries Management Zones", () => {
    assert.deepEqual(FMZ_NUMBERS, Array.from({ length: 20 }, (_, index) => index + 1));
  });

  it("uses official Ontario sources for licence, limits, regulations, and waterbody checks", () => {
    for (const url of Object.values(licenceFmzGuideLinks)) {
      assert.match(url, /^https:\/\/(www\.)?(ontario\.ca|lioapplications\.lrc\.gov\.on\.ca)\//);
    }
  });
});
