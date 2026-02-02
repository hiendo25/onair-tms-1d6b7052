import { createSVClient } from "@/services";

const unique = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

export const checkAssignmentAccess = async (
  assignmentId: string,
  employeeId: string,
): Promise<boolean> => {
  if (!assignmentId || !employeeId) {
    return false;
  }

  const supabase = await createSVClient();

  const { data: directAssignment, error: directError } = await supabase
    .from("assignment_employees")
    .select("employee_id")
    .eq("assignment_config_id", assignmentId)
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (directError) {
    throw new Error(`Failed to check direct assignment: ${directError.message}`);
  }

  if (directAssignment) {
    return true;
  }

  const { data: sessionRows, error: sessionError } = await supabase
    .from("assignment_class_session")
    .select("class_sessions!inner(class_room_id)")
    .eq("assignment_config_id", assignmentId);

  if (sessionError) {
    throw new Error(`Failed to fetch assignment class sessions: ${sessionError.message}`);
  }

  const classRoomIds = unique(
    (sessionRows ?? []).map((row: any) => row.class_sessions?.class_room_id),
  );

  if (classRoomIds.length === 0) {
    return false;
  }

  const { data: membershipRows, error: membershipError } = await supabase
    .from("class_room_employee")
    .select("id")
    .eq("employee_id", employeeId)
    .in("class_room_id", classRoomIds)
    .limit(1);

  if (membershipError) {
    throw new Error(`Failed to check class room membership: ${membershipError.message}`);
  }

  return (membershipRows ?? []).length > 0;
};
