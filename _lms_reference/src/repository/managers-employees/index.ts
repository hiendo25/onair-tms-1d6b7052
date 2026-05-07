import { createSVClient } from "@/services";

export async function createManagerRelationship(data: {
  employee_id: string;
  manager_id: string;
}) {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("managers_employees")
    .insert(data);

  if (error) {
    throw new Error(`Failed to create manager relationship: ${error.message}`);
  }
}

export async function deleteManagerRelationshipsByEmployeeId(employeeId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("managers_employees")
    .delete()
    .eq("employee_id", employeeId);

  if (error) {
    throw new Error(`Failed to delete manager relationships: ${error.message}`);
  }
}

export async function deleteAllManagerRelationshipsForEmployee(employeeId: string) {
  const supabase = await createSVClient();

  const { error } = await supabase
    .from("managers_employees")
    .delete()
    .or(`employee_id.eq.${employeeId},manager_id.eq.${employeeId}`);

  if (error) {
    throw new Error(`Failed to delete all manager relationships: ${error.message}`);
  }
}

