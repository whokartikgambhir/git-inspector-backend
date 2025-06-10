// external dependencies
import { assert } from "chai";

// internal dependencies
import * as appEntry from "../../index";

describe("index.ts coverage shim", () => {
  it("should load index.ts to include it in coverage", () => {
    assert.isOk(appEntry);
  });
});
