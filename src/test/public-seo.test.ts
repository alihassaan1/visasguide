import { describe, expect, it } from "vitest";
import { canonicalVisaPath, publicHead } from "@/lib/public-seo";
import { QueryClient } from "@tanstack/react-query";
import { seedQueries } from "@/lib/seedQueries";

describe("Public crawler responses", () => {
  it("consolidates all historical visa pair slug formats", () => {
    for (const slug of ["india-to-france", "india-to-france-visa-requirements", "visa-requirements/india-to-france"]) {
      expect(canonicalVisaPath(slug)).toBe("/visa-requirements/india-to-france");
    }
  });
  it("excludes missing resources from indexing without a misleading canonical", () => {
    const head = publicHead();
    expect(head.meta.find(tag => tag.name === "robots")?.content).toBe("noindex, follow");
    expect(head.links).toEqual([]);
  });
  it("restores cached null and primary data without treating null as an unfetched result", () => {
    const qc = new QueryClient();
    seedQueries(qc, JSON.stringify([[["news-article", "example"], null], [["content-page-blog", "example"], { content: "Full article" }]]));
    expect(qc.getQueryData(["news-article", "example"])).toBeNull();
    expect(qc.getQueryData(["content-page-blog", "example"])).toEqual({ content: "Full article" });
    qc.clear();
  });
});