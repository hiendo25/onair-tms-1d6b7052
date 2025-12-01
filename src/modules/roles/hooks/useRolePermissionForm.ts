// import { PermissionActions } from "@/constants/permission.constant";
import { PermissionActions } from "@/model/permission.model";
import { PermissionParams } from "@/repository/roles";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PermissionModule, RoleFormData } from "../types";

export interface UseRolePermissionsReturn {
  // Static data (never changes)
  modules: Record<string, PermissionModule>;

  // Mutable data
  selectedPermissions: Map<string, Set<PermissionActions>>;
  setSelectedPermissions: React.Dispatch<React.SetStateAction<Map<string, Set<PermissionActions>>>>;

  // Actions
  toggleAction: (moduleId: string, permCode: PermissionActions) => void;
  isFullySelected: boolean;
  isPartiallySelected: boolean;
  toggleAll: () => void;
  isPendingToggleAll: boolean;
  getChanges: () => { created: PermissionParams[]; deleted: PermissionParams[] };
  selectedPermissionsArray: Record<string, { moduleId: string; permLabel: string; permCode: PermissionActions }[]>;
}

export const useRolePermissionFormData = (initialData: Partial<RoleFormData>): UseRolePermissionsReturn => {
  const modules = useRef(initialData.modules || {}).current;
  const originalSelectedPermissions = useRef(
    new Map<string, Set<PermissionActions>>(initialData.originalSelectedPermissions),
  ).current;

  const [selectedPermissions, setSelectedPermissions] = useState(
    new Map<string, Set<PermissionActions>>(initialData.selectedPermissions),
  );

  const [isPendingToggleAll, toggleAllTransition] = useTransition();

  const toggleAction = useCallback((moduleId: string, permCode: PermissionActions) => {
    setSelectedPermissions((prev) => {
      const newMap = new Map(prev);
      const permCodes = new Set(newMap.get(moduleId) || []);

      if (permCodes.has(permCode)) permCodes.delete(permCode);
      else permCodes.add(permCode);

      if (permCodes.size === 0) newMap.delete(moduleId);
      else newMap.set(moduleId, permCodes);

      return newMap;
    });
  }, []);

  // all selection
  const totalPermissionsCount = useRef(
    Object.values(modules).reduce((acc, module) => acc + module.actions.length, 0),
  ).current;

  const isFullySelected = useMemo(() => {
    const totalSelectedCount = Array.from(selectedPermissions.values()).reduce((acc, permSet) => acc + permSet.size, 0);
    return totalSelectedCount === totalPermissionsCount;
  }, [selectedPermissions, totalPermissionsCount]);

  const isPartiallySelected = useMemo(() => {
    const selectedCount = Array.from(selectedPermissions.values()).reduce((acc, permSet) => acc + permSet.size, 0);
    return selectedCount > 0 && selectedCount < totalPermissionsCount;
  }, [selectedPermissions, totalPermissionsCount]);

  const toggleAll = useCallback(() => {
    toggleAllTransition(() => {
      setSelectedPermissions((_) => {
        const newMap = new Map<string, Set<PermissionActions>>();
        if (isFullySelected) {
          return newMap;
        } else {
          Object.values(modules).forEach((module) => {
            const allPermCodes = new Set<PermissionActions>(module.actions.map((action) => action.code));
            newMap.set(module.id, allPermCodes);
          });
          return newMap;
        }
      });
    });
  }, [modules, isFullySelected]);

  const selectedRef = useRef(selectedPermissions);

  useEffect(() => {
    selectedRef.current = selectedPermissions;
  }, [selectedPermissions]);

  // compute changes
  const getChanges = () => {
    const selected = selectedRef.current;

    const created: PermissionParams[] = [];
    const deleted: PermissionParams[] = [];

    selected.forEach((permSet, moduleId) => {
      const originalPermSet = originalSelectedPermissions.get(moduleId) || new Set<PermissionActions>();

      permSet.forEach((permCode) => {
        if (!originalPermSet.has(permCode)) {
          created.push({
            group_permission_id: moduleId,
            action_code: permCode,
          });
        }
      });
    });

    originalSelectedPermissions.forEach((permSet, moduleId) => {
      const currentPermSet = selected.get(moduleId) || new Set<PermissionActions>();

      permSet.forEach((permCode) => {
        if (!currentPermSet.has(permCode)) {
          deleted.push({
            group_permission_id: moduleId,
            action_code: permCode,
          });
        }
      });
    });

    return { created, deleted };
  };

  const selectedPermissionsArray = useMemo(() => {
    const result: Record<string, { moduleId: string; permLabel: string; permCode: PermissionActions }[]> = {};

    selectedPermissions.forEach((permSet, moduleId) => {
      const module = modules[moduleId];
      if (module) {
        permSet.forEach((permCode) => {
          const perm = module.actions.find((p) => p.code === permCode);
          if (perm) {
            if (!result[module.name]) result[module.name] = [];

            result[module.name]!.push({ moduleId: module.id, permLabel: perm.label, permCode: perm.code });
          }
        });
      }
    });

    return result;
  }, [modules, selectedPermissions]);

  return {
    // Static
    modules,

    // Mutable
    selectedPermissions,
    setSelectedPermissions,

    // Actions
    toggleAction,
    isFullySelected,
    isPartiallySelected,
    toggleAll,
    isPendingToggleAll,
    getChanges,
    selectedPermissionsArray,
  };
};
