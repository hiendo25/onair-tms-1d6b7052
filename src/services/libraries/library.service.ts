import { libraryRepository } from "@/repository";
import { Database } from "@/types/supabase.types";
import { createClient } from "@/services";

type Library = Database["public"]["Tables"]["libraries"]["Row"];
type Resource = Database["public"]["Tables"]["resources"]["Row"];

async function getCurrentEmployee() {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User not authenticated");
  }

  const { data: employee, error } = await supabase
    .from("employees")
    .select("id, organization_id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch employee: ${error.message}`);
  }

  if (!employee) {
    throw new Error("Employee not found");
  }

  return employee;
}

export async function getCurrentUserLibrary(): Promise<Library | null> {
  const employee = await getCurrentEmployee();
  return libraryRepository.getLibraryByEmployeeId(employee.id);
}

export async function getLibraryResources(libraryId: string): Promise<Resource[]> {
  return libraryRepository.getResourcesByLibrary(libraryId);
}

export async function getLibraryResourcesByFolder(
  libraryId: string,
  folderId: string | null
): Promise<Resource[]> {
  return libraryRepository.getResourcesByLibraryAndFolder(libraryId, folderId);
}

export async function deleteResource(resourceId: string): Promise<void> {
  return libraryRepository.deleteResource(resourceId);
}

export async function createFolder(
  name: string,
  libraryId: string,
  parentId: string | null
): Promise<Resource> {
  const employee = await getCurrentEmployee();

  if (!employee.organization_id) {
    throw new Error("Employee does not belong to an organization");
  }

  return libraryRepository.createFolder({
    name,
    library_id: libraryId,
    parent_id: parentId,
    organization_id: employee.organization_id,
    created_by: employee.id,
  });
}

export async function renameResource(resourceId: string, newName: string): Promise<void> {
  return libraryRepository.renameResource(resourceId, newName);
}

export async function createFileResource(
  name: string,
  libraryId: string,
  parentId: string | null,
  path: string,
  size: number,
  mimeType: string,
  extension: string,
  thumbnailUrl: string | null
): Promise<Resource> {
  const employee = await getCurrentEmployee();

  if (!employee.organization_id) {
    throw new Error("Employee does not belong to an organization");
  }

  return libraryRepository.createFileResource({
    name,
    library_id: libraryId,
    parent_id: parentId,
    organization_id: employee.organization_id,
    created_by: employee.id,
    path,
    size,
    mime_type: mimeType,
    extension,
    thumbnail_url: thumbnailUrl,
  });
}

export async function getResourceById(resourceId: string): Promise<Resource> {
  const employee = await getCurrentEmployee();

  if (!employee.organization_id) {
    throw new Error("Employee does not belong to an organization");
  }

  const resource = await libraryRepository.getResourceById(resourceId);

  if (resource.organization_id !== employee.organization_id) {
    throw new Error("Access denied: Resource does not belong to your organization");
  }

  return resource;
}

export async function getResourcesByIds(resourceIds: string[]): Promise<Resource[]> {
  const employee = await getCurrentEmployee();

  if (!employee.organization_id) {
    throw new Error("Employee does not belong to an organization");
  }

  const resources = await libraryRepository.getResourcesByIds(resourceIds);

  const unauthorizedResources = resources.filter(
    (resource) => resource.organization_id !== employee.organization_id
  );

  if (unauthorizedResources.length > 0) {
    throw new Error("Access denied: Some resources do not belong to your organization");
  }

  return resources;
}
