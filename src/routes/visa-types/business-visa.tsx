import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/visa-types/business-visa")({
  beforeLoad: () => { throw redirect({ to: "/visa-types/business", statusCode: 301 }); },
});