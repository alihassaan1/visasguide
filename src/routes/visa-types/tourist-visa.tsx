import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/visa-types/tourist-visa")({
  beforeLoad: () => { throw redirect({ to: "/visa-types/tourist", statusCode: 301 }); },
});