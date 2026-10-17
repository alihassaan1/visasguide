import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/countries/$countrySlug/$citySlug")({
  beforeLoad: ({ params }) => { throw redirect({ href: `/${params.countrySlug}/${params.citySlug}`, statusCode: 301 }); },
});
