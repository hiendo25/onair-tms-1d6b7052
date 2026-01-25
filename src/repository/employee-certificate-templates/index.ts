/**
 * Employee Certificate Templates Repository
 * Database operations for employee certificates
 */

import { createClient, createSVClient } from "@/services";
import type { Database } from "@/types/supabase.types";

type EmployeeCertificateTemplateRow = Database["public"]["Tables"]["employee_certificate_templates"]["Row"];
type EmployeeCertificateTemplateInsert = Database["public"]["Tables"]["employee_certificate_templates"]["Insert"];

export type CreateEmployeeCertificateTemplatePayload = {
  employee_id: string;
  certificate_template_id: string;
  class_room_id: string;
  image_url: string;
  layout_config: any;
  data: any;
};

/**
 * Create employee certificate template record
 */
export async function createEmployeeCertificateTemplate(
  payload: CreateEmployeeCertificateTemplatePayload
): Promise<EmployeeCertificateTemplateRow> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_certificate_templates")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[EmployeeCertificateTemplates] Error creating certificate:", error);
    throw new Error(`Failed to create employee certificate: ${error.message}`);
  }

  return data;
}

/**
 * Get employee certificate by ID
 */
export async function getEmployeeCertificateById(
  id: string
): Promise<EmployeeCertificateTemplateRow | null> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_certificate_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[EmployeeCertificateTemplates] Error fetching certificate:", error);
    return null;
  }

  return data;
}

/**
 * Get employee certificates by employee ID
 */
export async function getEmployeeCertificatesByEmployeeId(
  employeeId: string
): Promise<EmployeeCertificateTemplateRow[]> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_certificate_templates")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[EmployeeCertificateTemplates] Error fetching certificates:", error);
    throw new Error(`Failed to fetch employee certificates: ${error.message}`);
  }

  return data || [];
}

/**
 * Get employee certificate for a specific classroom
 */
export async function getEmployeeCertificateByClassRoom(
  employeeId: string,
  classRoomId: string
): Promise<EmployeeCertificateTemplateRow | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("employee_certificate_templates")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("class_room_id", classRoomId)
    .maybeSingle();

  if (error) {
    console.error("[EmployeeCertificateTemplates] Error fetching certificate:", error);
    return null;
  }

  return data;
}

/**
 * Check if employee already has certificate for a specific classroom
 */
export async function hasEmployeeCertificate(
  employeeId: string,
  certificateTemplateId: string,
  classRoomId: string
): Promise<boolean> {
  const supabase = await createSVClient();

  const { data, error } = await supabase
    .from("employee_certificate_templates")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("certificate_template_id", certificateTemplateId)
    .eq("class_room_id", classRoomId)
    .maybeSingle();

  if (error) {
    console.error("[EmployeeCertificateTemplates] Error checking certificate:", error);
    return false;
  }

  return !!data;
}
