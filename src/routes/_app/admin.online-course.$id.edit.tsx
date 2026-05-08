import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/admin/online-course/$id/edit")({
  component: () => {
    const { id } = Route.useParams();
    return <Navigate to="/admin/online-course/$id/editor" params={{ id }} />;
  },
});
