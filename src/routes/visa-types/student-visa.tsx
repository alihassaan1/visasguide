import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/visa-types/student-visa")({
  beforeLoad: () => { throw redirect({ to: "/visa-types/student", statusCode: 301 }); },
});