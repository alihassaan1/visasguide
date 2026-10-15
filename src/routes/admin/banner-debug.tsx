import { createFileRoute } from "@tanstack/react-router";
import BannerSlotDebugger from "@/pages/admin/BannerSlotDebugger";

export const Route = createFileRoute("/admin/banner-debug")({
  component: BannerSlotDebugger,
});
