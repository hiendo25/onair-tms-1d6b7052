import { createFileRoute, redirect } from "@tanstack/react-router";

// Canonical survey statistics are now at /admin/surveys/$id/statistics.
// This route redirects legacy survey-results deep-links to the merged page.
export const Route = createFileRoute("/_app/admin/surveys-results/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/admin/surveys/$id/statistics", params: { id: params.id }, replace: true });
  },
  component: () => null,
});
