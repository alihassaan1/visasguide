import { describe, expect, it } from "vitest";
import {
  DEFAULT_SORT,
  nextSort,
  sortAriaSort,
  type SortState,
} from "@/lib/contentSort";

describe("content table sorting", () => {
  it("opens view counts highest first", () => {
    expect(nextSort(DEFAULT_SORT, "view_count")).toEqual({ column: "view_count", dir: "desc" });
  });

  it("flips the direction when the same column is clicked again", () => {
    const desc: SortState = { column: "view_count", dir: "desc" };
    expect(nextSort(desc, "view_count")).toEqual({ column: "view_count", dir: "asc" });
    expect(nextSort({ column: "view_count", dir: "asc" }, "view_count")).toEqual({
      column: "view_count",
      dir: "desc",
    });
  });

  it("starts text columns A to Z", () => {
    expect(nextSort(DEFAULT_SORT, "title")).toEqual({ column: "title", dir: "asc" });
    expect(nextSort(DEFAULT_SORT, "slug")).toEqual({ column: "slug", dir: "asc" });
  });

  it("keeps the default newest-first order", () => {
    expect(DEFAULT_SORT).toEqual({ column: "created_at", dir: "desc" });
  });

  it("reports sort state only for the active column", () => {
    const sort: SortState = { column: "view_count", dir: "desc" };
    expect(sortAriaSort(sort, "view_count")).toBe("descending");
    expect(sortAriaSort({ column: "view_count", dir: "asc" }, "view_count")).toBe("ascending");
    expect(sortAriaSort(sort, "title")).toBe("none");
  });
});
