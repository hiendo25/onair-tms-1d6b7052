"use server";
import { Metadata, ResolvingMetadata } from "next";

import PageContainer from "@/shared/ui/PageContainer";
type OrganizationsProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: OrganizationsProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: "Doanh nghiệp",
    description: "Doanh nghiệp",
  };
}

export default async function Organizations(props: OrganizationsProps) {
  return (
    <PageContainer>
      <div className="flex items-center justify-center">
        <div>Danh sach organizations</div>
      </div>
    </PageContainer>
  );
}
