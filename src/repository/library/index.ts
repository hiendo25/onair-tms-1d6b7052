import { createClient } from "@/services";
import { Database } from "@/types/supabase.types";

type Library = Database["public"]["Tables"]["libraries"]["Row"];
type Resource = Database["public"]["Tables"]["resources"]["Row"];

export async function getLibraryByEmployeeId(employeeId: string): Promise<Library | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("libraries")
    .select("*")
    .eq("owner_id", employeeId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch library: ${error.message}`);
  }

  return data;
}

export async function getResourcesByLibrary(libraryId: string): Promise<Resource[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("library_id", libraryId)
    .is("deleted_at", null)
    .order("kind", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch resources: ${error.message}`);
  }

  return data || [];
}

export async function getResourcesByLibraryAndFolder(
  libraryId: string,
  folderId: string | null
): Promise<Resource[]> {
  const supabase = createClient();

  let query = supabase
    .from("resources")
    .select("*")
    .eq("library_id", libraryId)
    .is("deleted_at", null);

  if (folderId === null) {
    query = query.is("parent_id", null);
  } else {
    query = query.eq("parent_id", folderId);
  }

  const { data, error } = await query
    .order("kind", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch resources: ${error.message}`);
  }

  return data || [];
}

export async function deleteResource(resourceId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("resources")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", resourceId);

  if (error) {
    throw new Error(`Failed to delete resource: ${error.message}`);
  }
}

export async function createFolder(data: {
  name: string;
  library_id: string;
  parent_id: string | null;
  organization_id: string;
  created_by: string;
}): Promise<Resource> {
  const supabase = createClient();

  const { data: folder, error } = await supabase
    .from("resources")
    .insert({
      name: data.name,
      kind: "folder",
      library_id: data.library_id,
      parent_id: data.parent_id,
      organization_id: data.organization_id,
      created_by: data.created_by,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create folder: ${error.message}`);
  }

  return folder;
}

export async function renameResource(resourceId: string, newName: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("resources")
    .update({
      name: newName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resourceId);

  if (error) {
    throw new Error(`Failed to rename resource: ${error.message}`);
  }
}

export async function createFileResource(data: {
  name: string;
  library_id: string;
  parent_id: string | null;
  organization_id: string;
  created_by: string;
  path: string;
  size: number;
  mime_type: string;
  extension: string;
  thumbnail_url: string | null;
}): Promise<Resource> {
  const supabase = createClient();

  const { data: file, error } = await supabase
    .from("resources")
    .insert({
      name: data.name,
      kind: "file",
      library_id: data.library_id,
      parent_id: data.parent_id,
      organization_id: data.organization_id,
      created_by: data.created_by,
      path: data.path,
      size: data.size,
      mime_type: data.mime_type,
      extension: data.extension,
      thumbnail_url: data.thumbnail_url,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create file resource: ${error.message}`);
  }

  return file;
}

export async function getResourceById(resourceId: string): Promise<Resource> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(`Failed to fetch resource: ${error.message}`);
  }

  if (!data) {
    throw new Error("Resource not found");
  }

  return data;
}

export async function getResourcesByIds(resourceIds: string[]): Promise<Resource[]> {
  const supabase = createClient();

  if (resourceIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .in("id", resourceIds)
    .is("deleted_at", null);

  if (error) {
    throw new Error(`Failed to fetch resources: ${error.message}`);
  }

  return data || [];
}
