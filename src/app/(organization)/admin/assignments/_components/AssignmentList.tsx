"use client";

import * as React from "react";
import { Alert, Box, Card, CircularProgress, Pagination, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import useNotifications from "@/hooks/useNotifications/useNotifications";
import { useDeleteAssignmentBankMutation } from "@/modules/assignment-management/operations/mutation";
import { useGetAssignmentBanksQuery } from "@/modules/assignment-management/operations/query";
import { useGetClassFieldQuery } from "@/modules/class-room-management/operation/query";
import { useUserOrganization } from "@/modules/organization";
import PageContainer from "@/shared/ui/PageContainer";

import AssignmentBankCard from "./AssignmentBankCard";
import AssignmentBankToolbar from "./AssignmentBankToolbar";

const PAGE_SIZE = 12;

export default function AssignmentList() {
  const router = useRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const currentOrganization = useUserOrganization((state) => state.currentOrganization);

  const [page, setPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");

  const organizationId = currentOrganization.orgId;

  const {
    data: assignmentResult,
    isLoading,
    error,
  } = useGetAssignmentBanksQuery({
    page: page - 1,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    organizationId,
    categoryId: categoryId || undefined,
  });

  const { mutateAsync: deleteAssignment } = useDeleteAssignmentBankMutation();
  const { data: categoryListData } = useGetClassFieldQuery();

  const assignments = assignmentResult?.data || [];
  const totalCount = assignmentResult?.total || 0;
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  const categoryOptions = React.useMemo(
    () =>
      (categoryListData?.data || []).map((category) => ({
        label: category.name || "",
        value: category.id,
      })),
    [categoryListData?.data],
  );

  const handleCreateAssignment = () => {
    router.push(PATHS.ASSIGNMENTS.CREATE_ASSIGNMENT);
  };

  const handleEditAssignment = React.useCallback(
    (assignmentId: string) => {
      router.push(PATHS.ASSIGNMENTS.EDIT_ASSIGNMENT(assignmentId));
    },
    [router],
  );

  const handleViewAssignment = React.useCallback(
    (assignmentId: string) => {
      router.push(PATHS.ASSIGNMENTS.DETAIL_ASSIGNMENT(assignmentId));
    },
    [router],
  );

  const handleAssignEmployees = React.useCallback(
    (assignmentId: string) => {
      router.push(PATHS.ASSIGNMENTS.ASSIGN_EMPLOYEES(assignmentId));
    },
    [router],
  );

  const handleDeleteAssignment = React.useCallback(
    async (assignmentId: string) => {
      const confirmed = await dialogs.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này không?", {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      });

      if (!confirmed) {
        return;
      }

      try {
        await deleteAssignment(assignmentId);
        notifications.show("Xóa bài kiểm tra thành công", { severity: "success", autoHideDuration: 3000 });
      } catch (deleteError) {
        notifications.show(
          deleteError instanceof Error ? deleteError.message : "Có lỗi xảy ra khi xóa bài kiểm tra",
          {
            severity: "error",
            autoHideDuration: 5000,
          },
        );
      }
    },
    [deleteAssignment, dialogs, notifications],
  );

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setPage(1);
  }, [categoryId]);

  const displayFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const displayTo = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <PageContainer
      title="Ngân hàng bài kiểm tra"
      breadcrumbs={[{ title: "Bài kiểm tra", path: PATHS.ASSIGNMENTS.ROOT }]}
    >
      <Box sx={{ py: 3 }}>
        <Card sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Tổng bài kiểm tra ({totalCount})
              </Typography>
            </Stack>

            <AssignmentBankToolbar
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              categoryValue={categoryId}
              categoryOptions={categoryOptions}
              onCategoryChange={setCategoryId}
              onCreate={handleCreateAssignment}
            />

            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 320,
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">Có lỗi xảy ra khi tải danh sách bài kiểm tra</Alert>
            ) : assignments.length === 0 ? (
              <Box sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Không tìm thấy bài kiểm tra nào
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(4, 1fr)",
                    },
                  }}
                >
                  {assignments.map((assignment) => (
                    <AssignmentBankCard
                      key={assignment.id}
                      assignment={assignment}
                      onView={() => handleViewAssignment(assignment.id)}
                      onAssign={() => handleAssignEmployees(assignment.id)}
                      onEdit={() => handleEditAssignment(assignment.id)}
                      onDelete={() => handleDeleteAssignment(assignment.id)}
                    />
                  ))}
                </Box>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="caption" color="text.secondary">
                    Hiển thị {displayFrom}-{displayTo} trên {totalCount}
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                    shape="rounded"
                  />
                </Stack>
              </>
            )}
          </Stack>
        </Card>
      </Box>
    </PageContainer>
  );
}
