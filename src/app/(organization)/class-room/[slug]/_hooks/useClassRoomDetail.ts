import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ROUTE_QUERY_KEYS } from "@/constants/route-query.constant";
import { useGetClassRoomQuery } from "@/modules/class-room-management/operations/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { ClassRoomDetailWithProgress } from "@/services/class-room/class-room-progress-mapping.service";
import {
  CLASSROOM_DETAIL_BREADCRUMB_FALLBACK,
  CLASSROOM_DETAIL_PAGE_TITLE,
  CLASSROOM_LIST_BREADCRUMB,
} from "../_constants";

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface UseClassRoomDetailResult {
  classRoomData: ClassRoomDetailWithProgress | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  isAdminView: boolean;
  isFromLearningPath: boolean;
  learningPathId: string | null;
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
}

const buildBreadcrumbs = (classRoomData: ClassRoomDetailWithProgress | null): BreadcrumbItem[] => {
  if (!classRoomData?.slug) {
    return [CLASSROOM_LIST_BREADCRUMB];
  }

  return [
    CLASSROOM_LIST_BREADCRUMB,
    {
      title: classRoomData.title || CLASSROOM_DETAIL_BREADCRUMB_FALLBACK,
      path: `/class-room/${classRoomData.slug}`,
    },
  ];
};

export const useClassRoomDetail = (slug: string): UseClassRoomDetailResult => {
  const searchParams = useSearchParams();
  const learningPathId = searchParams.get(ROUTE_QUERY_KEYS.LEARNING_PATH_ID);
  const isFromLearningPath = Boolean(learningPathId);

  const { id: employeeId, type: employeeType } = useUserOrganization(
    (state) => state.currentEmployee,
  );

  const {
    data: classRoomResponse,
    isLoading,
    isError,
    error,
  } = useGetClassRoomQuery(slug, { learningPathId });

  const classRoomData = classRoomResponse?.data ?? null;
  const errorMessage =
    classRoomResponse?.error?.message ??
    (error instanceof Error ? error.message : null);

  const isAdminView = useMemo(() => {
    if (!classRoomData) {
      return false;
    }

    return (
      classRoomData.owner?.id === employeeId ||
      employeeType === "admin" ||
      employeeType === "teacher"
    );
  }, [classRoomData, employeeId, employeeType]);

  const breadcrumbs = useMemo(() => buildBreadcrumbs(classRoomData), [classRoomData]);

  return {
    classRoomData,
    isLoading,
    isError,
    errorMessage,
    isAdminView,
    isFromLearningPath,
    learningPathId,
    breadcrumbs,
    pageTitle: CLASSROOM_DETAIL_PAGE_TITLE,
  };
};
