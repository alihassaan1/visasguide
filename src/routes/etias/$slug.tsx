import { createFileRoute, notFound } from "@tanstack/react-router";
import EtiasSubPage from "@/pages/etias/EtiasSubPage";

import { publicHead } from "@/lib/public-seo";
import NotFound from "@/pages/NotFound";
import { ETIAS_SUB_PAGES } from "@/lib/etiasContent";

export const Route = createFileRoute("/etias/$slug")({
  beforeLoad: ({ params }) => { if (!ETIAS_SUB_PAGES[params.slug]) throw notFound(); },
  head: ({ params }) => { const page = ETIAS_SUB_PAGES[params.slug]; return publicHead(page ? { title: page.title, description: page.seoDescription, path: `/etias/${page.slug}` } : undefined); },
  notFoundComponent: NotFound,
  component: EtiasSubPage,
});
