import { createFileRoute } from "@tanstack/react-router";
import PassportRankings from "@/pages/PassportRankings";

export const Route = createFileRoute("/passport-index")({
  component: PassportRankings,
});
