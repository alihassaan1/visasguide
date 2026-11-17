import { describe, expect, it } from "vitest";
import { canonicalVisaPath, publicHead, visaPairMeta } from "@/lib/public-seo";
import { articleStructuredData, visibleArticleFaqs } from "@/lib/seo-structured-data";
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
  it("keeps content indexable by default", () => {
    expect(publicHead({ title: "Visa guide", description: "Entry rules", path: "/visa-guide" }).meta.find(tag => tag.name === "robots")?.content).toBe("index, follow, max-image-preview:large");
  });
  it("excludes explicitly disabled content from search indexing without hiding the page", () => {
    const head = publicHead({ title: "Visa guide", description: "Entry rules", path: "/visa-guide", seoIndex: false });
    expect(head.meta.find(tag => tag.name === "robots")?.content).toBe("noindex, follow");
    expect(head.links[0].href).toBe("https://visas.guide/visa-guide");
  });
  it("uses the requested unique 2026 pair title", () => {
    expect(visaPairMeta("Australia", "New Zealand").title).toBe("Australia to New Zealand Visa Requirements 2026 | visas.guide");
  });
  it("includes the recorded fee and stay in a 140 to 160 character description", () => {
    const meta = visaPairMeta("Australia", "New Zealand", { max_stay_days: 90, fee_usd: 17 });
    expect(meta.description).toContain("90 days");
    expect(meta.description).toContain("US$17");
    expect(meta.description.length).toBeGreaterThanOrEqual(140);
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });
  it("keeps descriptions within the requested length for long country names", () => {
    const meta = visaPairMeta("Saint Vincent and the Grenadines", "Democratic Republic of the Congo", { max_stay_days: 90, fee_usd: 185 });
    expect(meta.description.length).toBeGreaterThanOrEqual(140);
    expect(meta.description.length).toBeLessThanOrEqual(160);
    expect(meta.description).toContain("US$185");
  });
  it("preserves authoritative article dates and leaves unknown authors unspecified", () => {
    const article = articleStructuredData({ title: "Guide", datePublished: "2025-12-12T11:57:01.176Z", dateModified: "2026-06-09T06:26:55.989Z" });
    expect(article.datePublished).toBe("2025-12-12T11:57:01.176Z");
    expect(article.dateModified).toBe("2026-06-09T06:26:55.989Z");
    expect(article).not.toHaveProperty("author");
  });
  it("extracts only FAQ answers displayed within article headings and paragraphs", () => {
    expect(visibleArticleFaqs('<h2>Introduction</h2><p>Some text.</p><h2>Who needs a visa?</h2><p>Indian passport holders.</p><h2>Fees</h2><p>Check the embassy.</p>')).toEqual([{ question: "Who needs a visa?", answer: "Indian passport holders." }]);
  });
});