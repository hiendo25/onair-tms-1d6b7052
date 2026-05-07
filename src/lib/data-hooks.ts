import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "./org-context";
import { toast } from "sonner";

// ===== Branches =====
export type DBBranch = {
  id: string; org_id: string; code: string; name: string;
  address: string; phone: string; manager: string; employees: number; status: string;
};

export function useBranches() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["branches", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").eq("org_id", orgId).order("created_at");
      if (error) throw error;
      return data as DBBranch[];
    },
  });
}

export function useBranchMutations() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["branches", orgId] });

  const create = useMutation({
    mutationFn: async (payload: Partial<DBBranch>) => {
      const { error } = await supabase.from("branches").insert({ ...payload, org_id: orgId } as never);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Đã tạo chi nhánh"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<DBBranch> & { id: string }) => {
      const { error } = await supabase.from("branches").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Đã cập nhật"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Đã xoá"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkInsert = useMutation({
    mutationFn: async (rows: Partial<DBBranch>[]) => {
      const { error } = await supabase.from("branches").insert(rows.map((r) => ({ ...r, org_id: orgId })) as never);
      if (error) throw error;
    },
    onSuccess: () => invalidate(),
  });

  return { create, update, remove, bulkInsert };
}

// ===== Departments =====
export type DBDepartment = {
  id: string; org_id: string; code: string; name: string;
  branch: string; head: string; employees: number;
};

export function useDepartments() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["departments", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*").eq("org_id", orgId).order("created_at");
      if (error) throw error;
      return data as DBDepartment[];
    },
  });
}

export function useDepartmentMutations() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["departments", orgId] });
  return {
    create: useMutation({
      mutationFn: async (p: Partial<DBDepartment>) => {
        const { error } = await supabase.from("departments").insert({ ...p, org_id: orgId } as never);
        if (error) throw error;
      },
      onSuccess: () => { invalidate(); toast.success("Đã tạo phòng ban"); },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: async ({ id, ...p }: Partial<DBDepartment> & { id: string }) => {
        const { error } = await supabase.from("departments").update(p).eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => { invalidate(); toast.success("Đã cập nhật"); },
      onError: (e: Error) => toast.error(e.message),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("departments").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => { invalidate(); toast.success("Đã xoá"); },
      onError: (e: Error) => toast.error(e.message),
    }),
    bulkInsert: useMutation({
      mutationFn: async (rows: Partial<DBDepartment>[]) => {
        const { error } = await supabase.from("departments").insert(rows.map((r) => ({ ...r, org_id: orgId })) as never);
        if (error) throw error;
      },
      onSuccess: () => invalidate(),
    }),
  };
}

// ===== Roles =====
export type DBRole = {
  id: string; org_id: string; code: string; name: string;
  description: string; permissions: number; users: number;
};

export function useRoles() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["roles", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("org_roles").select("*").eq("org_id", orgId).order("created_at");
      if (error) throw error;
      return data as DBRole[];
    },
  });
}

export function useRoleMutations() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["roles", orgId] });
  return {
    create: useMutation({
      mutationFn: async (p: Partial<DBRole>) => {
        const { error } = await supabase.from("org_roles").insert({ ...p, org_id: orgId } as never);
        if (error) throw error;
      },
      onSuccess: () => { invalidate(); toast.success("Đã tạo vai trò"); },
      onError: (e: Error) => toast.error(e.message),
    }),
    update: useMutation({
      mutationFn: async ({ id, ...p }: Partial<DBRole> & { id: string }) => {
        const { error } = await supabase.from("org_roles").update(p).eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => { invalidate(); toast.success("Đã cập nhật"); },
      onError: (e: Error) => toast.error(e.message),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("org_roles").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => { invalidate(); toast.success("Đã xoá"); },
      onError: (e: Error) => toast.error(e.message),
    }),
  };
}
