import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ORGS, ORG_DATASETS, type OrgId, type OrgDataset, type OrgMeta } from "./org-data";

const STORAGE_KEY = "onair.currentOrgId";

type OrgCtx = {
  orgId: OrgId;
  org: OrgMeta;
  data: OrgDataset;
  orgs: OrgMeta[];
  setOrg: (id: OrgId) => void;
};

const Ctx = createContext<OrgCtx | null>(null);

function readInitial(): OrgId {
  if (typeof window === "undefined") return "highlands";
  const v = window.localStorage.getItem(STORAGE_KEY) as OrgId | null;
  return v && v in ORG_DATASETS ? v : "highlands";
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgId, setOrgId] = useState<OrgId>(readInitial);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, orgId);
  }, [orgId]);

  const value = useMemo<OrgCtx>(() => {
    const data = ORG_DATASETS[orgId];
    return { orgId, org: data.meta, data, orgs: ORGS, setOrg: setOrgId };
  }, [orgId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrg(): OrgCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrg must be used within OrgProvider");
  return ctx;
}

export function useOrgData(): OrgDataset {
  return useOrg().data;
}
