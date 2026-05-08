import { createFileRoute, redirect } from "@tanstack/react-router";

// Admin does not submit exams on behalf of students.
// This route was a placeholder; redirect to the grade view instead.
export const Route = createFileRoute("/_app/admin/assignments/$id/submit/$employeeId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/admin/assignments/$id/grade/$employeeId",
      params: { id: params.id, employeeId: params.employeeId },
      replace: true,
    });
  },
  component: () => null,
});
