import { describe, expect, it } from "vite-plus/test";
import { findUpdate } from "@/services/updateCheck";

const page = (src: string, version: string) =>
  `<html><body><li class="menu-version">v${version}</li>
   <script type="module" crossorigin src="${src}"></script></body></html>`;

describe("findUpdate", () => {
  it("reports the deployed version when the entry module changed", () => {
    expect(findUpdate("/assets/index-AAA.js", page("/assets/index-BBB.js", "0.9.18"))).toBe(
      "v0.9.18",
    );
  });

  it("returns null when the entry module is the one we run", () => {
    expect(findUpdate("/assets/index-AAA.js", page("/assets/index-AAA.js", "0.9.17"))).toBeNull();
  });

  it("returns null for a response without an entry module", () => {
    expect(findUpdate("/assets/index-AAA.js", "<html><body>404</body></html>")).toBeNull();
  });
});
