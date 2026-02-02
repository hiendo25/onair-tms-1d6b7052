"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ImportBranchPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page - the import dialog is opened from there
    router.replace("/department/branches");
  }, [router]);

  return null;
}
