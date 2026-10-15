import { createFileRoute } from "@tanstack/react-router";
import StudentVisa from "@/pages/visa-types/StudentVisa";

export const Route = createFileRoute("/visa-types/student")({
  component: StudentVisa,
});
