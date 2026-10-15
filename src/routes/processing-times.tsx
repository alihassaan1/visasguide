import { createFileRoute } from "@tanstack/react-router";
import ProcessingTimes from "@/pages/ProcessingTimes";

export const Route = createFileRoute("/processing-times")({
  component: ProcessingTimes,
});
