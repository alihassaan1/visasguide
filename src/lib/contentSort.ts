// Sort state for the admin content table. Sorting happens server-side
// (the library is paginated at 50 rows), so each key must be a real
// content_pages column.
export type SortDir = "asc" | "desc";

export type SortKey = "title" | "slug" | "is_published" | "view_count" | "created_at";

export interface SortState {
  column: SortKey;
  dir: SortDir;
}

export const DEFAULT_SORT: SortState = { column: "created_at", dir: "desc" };

// Text columns read best A→Z first; numbers, statuses and dates newest first.
const DEFAULT_DIR: Record<SortKey, SortDir> = {
  title: "asc",
  slug: "asc",
  is_published: "desc",
  view_count: "desc",
  created_at: "desc",
};

export function nextSort(current: SortState, column: SortKey): SortState {
  if (current.column === column) {
    return { column, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { column, dir: DEFAULT_DIR[column] };
}

export function sortAriaSort(current: SortState, column: SortKey): "ascending" | "descending" | "none" {
  if (current.column !== column) return "none";
  return current.dir === "asc" ? "ascending" : "descending";
}
