import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function PublicRouteError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return <main className="container mx-auto px-4 py-16 text-center">
    <h1 className="text-2xl font-bold mb-4">This page didn't load</h1>
    <p className="text-muted-foreground mb-6">Please try again in a moment.</p>
    <Button onClick={async () => { await router.invalidate(); reset(); }}>Try again</Button>
    <Button variant="link" asChild><Link to="/">Go home</Link></Button>
  </main>;
}