"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreateBranchPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page - the create dialog is opened from there
    router.replace("/department/branches");
  }, [router]);

  return null;
}
