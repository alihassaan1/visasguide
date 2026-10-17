import { createFileRoute, notFound } from "@tanstack/react-router";
import ThingsToDo from "@/pages/ThingsToDo";

import { publicHead } from "@/lib/public-seo";
import NotFound from "@/pages/NotFound";
import { getThingsToDo } from "@/data/thingsToDo";

export const Route = createFileRoute("/things-to-do/$countrySlug")({
  beforeLoad: ({ params }) => { if (!getThingsToDo(params.countrySlug)) throw notFound(); },
  head: ({ params }) => { const page = getThingsToDo(params.countrySlug); return publicHead(page ? { title: `Things to Do in ${page.country} | Attractions & Activities 2026`, description: `Discover attractions, when to visit, transport and travel tips for ${page.country}.`, path: `/things-to-do/${page.slug}` } : undefined); },
  notFoundComponent: NotFound,
  component: ThingsToDo,
});
