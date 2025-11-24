import * as React from "react";
import { Metadata } from "next";
import EditPlanForm from "./_components/EditPlanForm";

export const metadata: Metadata = {
  title: "Chỉnh sửa kế hoạch đào tạo",
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPlanPage({ params }: PageProps) {
  const { id } = await params;

  return <EditPlanForm planId={id} />;
}

