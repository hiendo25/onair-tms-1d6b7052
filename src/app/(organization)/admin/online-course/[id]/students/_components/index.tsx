"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import useDebounce from "@/hooks/useDebounce";
import { Pagination } from "@/shared/ui/Pagination";
import { SelectOption } from "@/shared/ui/form/SelectOption";
import { SearchIcon } from "@/shared/assets/icons";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useGetOrganizationUnitsQuery } from "@/modules/organization-units/operations/query";
import { useGetElearningStudentsQuery } from "@/modules/elearning/operations/query";
import type { ElearningCourseStudentDto } from "@/types/dto/elearning/elearning.dto";
import { ELEARNING_STUDENT_TABLE_HEAD } from "../constants/constants";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { GridMoreVertIcon } from "@mui/x-data-grid";
import { useDeleteUserInElearningMutation } from "@/modules/elearning/operations/mutation";
import { ConfirmDialog } from "@/shared/ui/custom-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface ElearningStudentsSectionProps {
  courseId: string;
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE = 600;

const resolveOrganizationUnitName = (
  student: ElearningCourseStudentDto,
  unitType: "branch" | "department",
) => {
  const employments = student.student?.employments ?? [];

  return (
    employments.find(
      (employment) => employment.organizationUnit?.type === unitType,
    )?.organizationUnit?.name ?? "-"
  );
};

const ElearningStudentsSection = ({ courseId }: ElearningStudentsSectionProps) => {

  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<string>("all");
  const [departmentId, setDepartmentId] = useState<string>("all");
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [studentsId, setStudentsId] = useState<string[]>([]);
  const [isAllowDeleteUser, setIsAllowDeleteUser] = useState(true);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE);

  const { organization } = useUserOrganization((state) => state.data);
  const organizationId = organization?.id;

  const { data: organizationUnits = [] } = useGetOrganizationUnitsQuery();

  const { mutateAsync: deleteUserInElearningCourse } = useDeleteUserInElearningMutation()

  const branchOptions = useMemo(() => {
    return (organizationUnits ?? []).filter(
      (unit) =>
        unit.organization_id === organizationId && unit.type === "branch",
    );
  }, [organizationUnits, organizationId]);

  const departmentOptions = useMemo(() => {
    return (organizationUnits ?? []).filter(
      (unit) =>
        unit.organization_id === organizationId &&
        unit.type === "department",
    );
  }, [organizationUnits, organizationId]);

  const normalizedSearch = debouncedSearch?.trim()
    ? debouncedSearch.trim()
    : undefined;
  const normalizedBranchId = branchId !== "all" ? branchId : undefined;
  const normalizedDepartmentId =
    departmentId !== "all" ? departmentId : undefined;

  const queryInput = useMemo(
    () => ({
      courseId,
      page,
      limit: PAGE_SIZE,
      search: normalizedSearch,
      branchId: normalizedBranchId,
      departmentId: normalizedDepartmentId,
    }),
    [courseId, page, normalizedSearch, normalizedBranchId, normalizedDepartmentId],
  );

  const {
    data: studentsResult,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetElearningStudentsQuery(queryInput);

  const students = studentsResult?.data ?? [];
  const totalStudents = studentsResult?.total ?? 0;

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleBranchChange = (value: string) => {
    setBranchId(value);
    setPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentId(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const handleDeleteUser = async () => {
    const payload = {
      courseId: courseId,
      studentsId,
    }
    await deleteUserInElearningCourse(payload);
    queryClient.invalidateQueries({ queryKey: ["elearning-courses"] })
    queryClient.invalidateQueries({ queryKey: ["elearning-course-students"] })
    setDeleteConfirmDialog(false);
  }

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box flex={1}>
          <TextField
            placeholder="Tìm kiếm"
            value={search}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 240 }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          flex={1}
        >
          <SelectOption
            inputLabel="Chi nhánh"
            onChange={handleBranchChange}
            value={branchId}
            options={[
              { display: true, label: "Tất cả", value: "all" },
              ...branchOptions.map((option) => ({
                display: true,
                label: option.name,
                value: option.id,
              })),
            ]}
            size="small"
          />

          <SelectOption
            inputLabel="Phòng ban"
            onChange={handleDepartmentChange}
            value={departmentId}
            options={[
              { display: true, label: "Tất cả", value: "all" },
              ...departmentOptions.map((option) => ({
                display: true,
                label: option.name,
                value: option.id,
              })),
            ]}
            size="small"
          />
        </Stack>
      </Box>

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        >
          Không thể tải danh sách học viên eLearning. Vui lòng thử lại sau.
        </Alert>
      ) : null}

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer>
          <Table
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                py: 2,
                px: 2,
              },
            }}
          >
            <TableHead
              sx={{
                backgroundColor: grey[100],
                "& .MuiTableCell-head": {
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  color: grey[700],
                },
              }}
            >
              <TableRow>
                {ELEARNING_STUDENT_TABLE_HEAD.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{
                      width: column.width,
                      whiteSpace: "nowrap",
                    }}
                    align={column.align}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody
              sx={{
                "& .MuiTableCell-root": {
                  borderBottomColor: grey[200],
                  verticalAlign: "middle",
                },
              }}
            >
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={ELEARNING_STUDENT_TABLE_HEAD.length}
                    align="center"
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                      sx={{ py: 4 }}
                    >
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        Đang tải dữ liệu học viên...
                      </Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={ELEARNING_STUDENT_TABLE_HEAD.length}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Không có học viên phù hợp với tiêu chí lọc hiện tại.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => {
                  const order = (page - 1) * PAGE_SIZE + index + 1;
                  return (
                    <TableRow
                      key={`${student.id}-${order}`}
                      sx={{
                        "&:last-child td": { borderBottom: "none" },
                        "&:hover": {
                          backgroundColor: grey[50],
                        },
                      }}
                    >
                      <TableCell align="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {order}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2" fontWeight={600} noWrap>
                            {student.student?.profile?.full_name ?? "-"}
                          </Typography>
                          <span>
                            <Chip label={student.student?.employee_code ?? "-"} variant="filled" color="success" />
                          </span>
                        </Stack>
                      </TableCell>
                      <TableCell>{student.student?.profile?.email ?? "-"}</TableCell>
                      <TableCell>{student.student?.profile?.phone_number ?? "-"}</TableCell>
                      <TableCell>
                        {resolveOrganizationUnitName(student, "branch")}
                      </TableCell>
                      <TableCell>
                        {resolveOrganizationUnitName(student, "department")}
                      </TableCell>
                      <TableCell align="center">
                        <PopupState variant="popover" popupId={`elearning-row-${student.id ?? index}`}>
                          {(popupState) => (
                            <>
                              <IconButton {...bindTrigger(popupState)}>
                                <GridMoreVertIcon />
                              </IconButton>
                              <Menu {...bindMenu(popupState)}>
                                <MenuItem onClick={() => {
                                  popupState.close()
                                  setDeleteConfirmDialog(true)
                                  setStudentsId([student.student_id])
                                }}>
                                  Gỡ học viên
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </PopupState>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {isFetching && !isLoading ? (
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              px: 2,
              py: 1,
              backgroundColor: grey[50],
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                Đang cập nhật danh sách...
              </Typography>
            </Stack>
          </Box>
        ) : null}
      </Box>

      {totalStudents > 0 ? (
        <Pagination
          onChange={handlePageChange}
          total={totalStudents}
          take={PAGE_SIZE}
          value={page}
          name="Học viên eLearning"
        />
      ) : null}

      <ConfirmDialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        title={isAllowDeleteUser ? "Xác nhận gỡ học viên khỏi lớp học" : "Không thể gỡ học viên khỏi lớp học"}
        content={isAllowDeleteUser ? "Bạn có chắc muốn gỡ học viên này khỏi lớp học trực tuyến? Sau khi gỡ, học viên sẽ không thể truy cập hoặc tham gia buổi học." : "Khi lớp học đang diễn ra hoặc đã diễn ra, hệ thống tạm khoá chức năng gỡ học viên để đảm bảo ổn định buổi học."}
        action={
          <>
            <Button variant="contained" color="error" onClick={handleDeleteUser} disabled={!isAllowDeleteUser}>
              Gỡ học viên
            </Button>
          </>
        }
      />
    </Stack>
  );
};

export default ElearningStudentsSection;
