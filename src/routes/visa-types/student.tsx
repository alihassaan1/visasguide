import { createFileRoute } from "@tanstack/react-router";
import StudentVisa from "@/pages/visa-types/StudentVisa";

import { publicHead } from "@/lib/public-seo";

export const Route = createFileRoute("/visa-types/student")({
  head: () => publicHead({ title: "Student Visa Guide 2026 | Visas.Guide", description: "Student visa requirements, fees and application guidance for studying abroad.", path: "/visa-types/student" }),
  component: StudentVisa,
});
