import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/countries/$countrySlug/visa-free")({
  beforeLoad: ({ params }) => { throw redirect({ href: `/${params.countrySlug}-passport-visa-free-countries`, statusCode: 301 }); },
});
