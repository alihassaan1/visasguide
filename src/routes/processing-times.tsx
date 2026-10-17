import { createFileRoute } from "@tanstack/react-router";
import ProcessingTimes from "@/pages/ProcessingTimes";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/processing-times")({
  head: () => publicHead({ title: "Global Visa Processing Times & Wait Times 2026 | By Country | Visas.Guide", description: "Compare visa processing times and wait times for tourist, business and student visas by destination.", path: "/processing-times" }),
  component: ProcessingTimes,
});
