import * as React from "react";
import {
  Alert,
  alpha,
  Button,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Pagination,
  PaginationProps,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";

import useDebounce from "@/hooks/useDebounce";
import { EmployeeStudentWithProfileItem } from "@/model/employee.model";
import { StudentSelectedItem } from "@/modules/class-room-management/store/class-room-store";
import { useUserOrganization } from "@/modules/organization";
import { GetStudentsQueryParams } from "@/repository/employee";
import { CloseIcon } from "@/shared/assets/icons";
import EmptyData from "@/shared/ui/EmptyData";
import { cn } from "@/utils";
// import useGetEmployeeQuery from "@/modules/class-room-management/operation/query";
import { useGetStudentsQuery } from "../../operation/query";

import CheckAllStudents from "./CheckAllStudent";
import EmployeeFilter, { EmployeeFilterProps } from "./EmployeeFilter";
import usePreviousData from "./usePreviousData";

const BoxWrapper = styled("div")(({ theme }) => ({
  border: "1px solid",
  borderColor: theme.palette.grey[300],
  height: 680,
  overflowY: "hidden",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
}));

const BoxHeader = styled(Box)(({ theme }) => ({
  paddingInline: "16px",
  paddingBlock: "12px",
  backgroundColor: theme.palette.grey[200],
}));

const BoxToolbar = styled(Toolbar)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    paddingInline: "16px",
  },
}));

const BoxContent = styled(Box)(() => ({
  height: "100%",
  overflowY: "auto",
  scrollbarWidth: "thin",
}));
export interface StudentDataTransferProps {
  selectedItems?: StudentSelectedItem[];
  selectedStudentIds?: string[];
  onChange?: (data: StudentSelectedItem[]) => void;
}
const StudentDataTransfer: React.FC<StudentDataTransferProps> = ({
  selectedItems = [],
  onChange,
  selectedStudentIds,
}) => {
  const { orgId } = useUserOrganization((state) => state.currentOrganization);

  const [queryParams, setQueryParams] = React.useState<Required<GetStudentsQueryParams>>({
    page: 1,
    pageSize: 20,
    search: "",
    departmentIds: [],
    branchIds: [],
    organizationId: orgId,
    excludes: [],
  });
  const [selectedStudents, setSelectedStudents] = React.useState<StudentSelectedItem[]>(selectedItems);

  const { data: employeeData, isPending } = useGetStudentsQuery({
    enabled: true,
    queryParams: {
      ...queryParams,
      search: useDebounce(queryParams.search, 600),
      organizationId: orgId,
    },
  });

  const employeeList = React.useMemo(() => {
    return employeeData?.data || [];
  }, [employeeData?.data]);

  const pageTotal = React.useMemo(() => {
    return employeeData?.count ? Math.ceil(employeeData.count / queryParams.pageSize) : 1;
  }, [employeeData?.count, queryParams.pageSize]);

  const totalItems = React.useMemo(() => employeeData?.count ?? 0, [employeeData?.count]);

  const previousData = usePreviousData(
    {
      items: employeeList,
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      pageTotal: pageTotal,
      total: totalItems,
    },
    [employeeList, queryParams, totalItems],
  );

  const studentPagingCount = React.useMemo(() => {
    if (queryParams.page === pageTotal) {
      return `${(queryParams.page - 1) * queryParams.pageSize} - ${previousData.total}`;
    }
    return `${(queryParams.page - 1) * queryParams.pageSize} - ${queryParams.page * queryParams.pageSize}`;
  }, [queryParams, pageTotal, previousData]);

  console.table(previousData);
  const handleChangePage: PaginationProps["onChange"] = (evt, newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleAddEmployee = (emp: EmployeeStudentWithProfileItem) => {
    const existItem = selectedStudents.find((it) => it.id === emp.id);

    const newSelectedStudents = existItem
      ? selectedStudents
      : [
          ...selectedStudents,
          {
            id: emp.id,
            email: emp.profiles.email,
            fullName: emp.profiles.full_name,
            employeeCode: emp.employee_code,
            avatar: emp.profiles.avatar,
            employeeType: emp.employee_type,
          },
        ];
    if (onChange) {
      onChange?.(newSelectedStudents);
      return;
    }

    setSelectedStudents(newSelectedStudents);
  };

  const handleRemoveItem = (itemId: string) => {
    const updateStudents = selectedStudents.filter((item) => item.id !== itemId);
    if (onChange) {
      onChange?.(updateStudents);
      return;
    }

    setSelectedStudents(updateStudents);
  };

  const handleCheckAllStudents = (checked?: boolean) => {
    const students = employeeData?.data;
    if (!students?.length) return;

    let newSelectedStudents: StudentSelectedItem[] = [];

    const studentsFormatted = students.map<StudentSelectedItem>((item) => ({
      id: item.id,
      fullName: item.profiles.full_name,
      email: item.profiles.email || "",
      employeeCode: item.employee_code,
      employeeType: item.employee_type,
      avatar: item.profiles.avatar || "",
    }));

    if (checked) {
      const studentsMap = new Map<string, StudentSelectedItem>();

      [...studentsFormatted, ...selectedStudents].forEach((item) => {
        studentsMap.set(item.id, item);
      });

      for (const [key, value] of studentsMap.entries()) {
        newSelectedStudents.push(value);
      }
    } else {
      selectedStudents.forEach((sltItem) => {
        if (studentsFormatted.every((it) => it.id !== sltItem.id)) {
          newSelectedStudents.push(sltItem);
        }
      });
    }
    if (onChange) {
      onChange?.(newSelectedStudents);
      return;
    }
    setSelectedStudents(newSelectedStudents);
  };

  const handleRemoveAll = () => {
    if (onChange) {
      onChange([]);
      return;
    }
    setSelectedStudents([]);
  };

  const handleChangeFilter: EmployeeFilterProps["onChange"] = (type) => (newValues) => {
    setQueryParams((prev) => ({
      ...prev,
      departmentIds: type === "department" ? newValues : prev.departmentIds,
      branchIds: type === "branch" ? newValues : prev.branchIds,
    }));
  };

  React.useEffect(() => {
    console.log({ selectedItems, selectedStudents });

    setSelectedStudents(selectedItems);
  }, [selectedItems, selectedStudents]);

  return (
    <div className="employee-data-transfer relative">
      {employeeData?.error ? <Alert severity="error">{employeeData.error.message}</Alert> : null}
      <div className="flex gap-6">
        <div className="w-1/2">
          <BoxWrapper>
            <BoxHeader>
              <Typography
                sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
              >{`Tất cả học viên (${totalItems})`}</Typography>
            </BoxHeader>
            <BoxToolbar>
              <CheckAllStudents
                onCheckAll={handleCheckAllStudents}
                selectedStudents={selectedStudents}
                students={employeeData?.data?.map((item) => ({ id: item.id, code: item.employee_code }))}
              />
              <EmployeeFilter
                onSearch={(searchText) => {
                  setQueryParams((prev) => ({ ...prev, search: searchText }));
                }}
                onChange={handleChangeFilter}
                selectedBranchIds={queryParams.branchIds}
                selectedDepartmentIds={queryParams.departmentIds}
              />
            </BoxToolbar>
            <Divider />
            <BoxContent
              className={cn({
                "opacity-60": isPending,
              })}
            >
              <div className="flex flex-col">
                {(isPending && previousData.items.length ? previousData.items : employeeList).map((emp) => (
                  <StudentItem
                    key={emp.id}
                    data={{
                      id: emp.id,
                      avatar: emp.profiles.avatar ?? undefined,
                      email: emp.profiles.email,
                      employeeCode: emp.employee_code,
                      fullName: emp.profiles.full_name,
                      departmentName: emp.employee_departments[0]?.departments?.name,
                    }}
                    onClick={() => handleAddEmployee(emp)}
                    isSelected={hasSelected(emp.id, selectedStudents)}
                  />
                ))}
                {!isPending && !employeeList.length && (
                  <div className="flex items-center justify-center p-6">
                    <EmptyData iconSize="small" description="Danh sách đang trống." />
                  </div>
                )}
              </div>
            </BoxContent>
            <Divider />
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <Typography
                  sx={{ fontSize: "0.875rem", color: "text.secondary" }}
                >{`Hiển thị ${studentPagingCount} / ${totalItems}`}</Typography>
              </div>
              <Pagination
                variant="text"
                size="small"
                shape="rounded"
                count={isPending ? previousData.pageTotal : pageTotal}
                page={isPending ? previousData.page : queryParams.page}
                onChange={handleChangePage}
                disabled={isPending}
              />
            </div>
          </BoxWrapper>
        </div>
        <div className="w-1/2">
          <BoxWrapper>
            <BoxHeader>
              <Typography
                sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
              >{`Học viên đã chọn (${selectedStudents.length})`}</Typography>
            </BoxHeader>
            <BoxToolbar>
              <Button variant="text" className="ml-auto" disabled={!selectedStudents.length} onClick={handleRemoveAll}>
                Xoá tất cả
              </Button>
            </BoxToolbar>
            <Divider />
            <BoxContent>
              {!selectedStudents?.length && (
                <EmptyData
                  title="Đang trống"
                  description={
                    <>
                      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                        Chưa có học viên nào được gán lớp học này.
                      </Typography>
                      <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                        vui lòng thêm học viên.
                      </Typography>
                    </>
                  }
                  className="mx-auto w-fit pt-12"
                />
              )}
              <div className="flex flex-col">
                {selectedStudents.map((emp) => (
                  <StudentItem
                    key={emp.id}
                    hideCheckbox
                    data={{
                      id: emp.id,
                      avatar: emp.avatar ?? undefined,
                      email: emp.email,
                      employeeCode: emp.employeeCode,
                      fullName: emp.fullName,
                    }}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </BoxContent>
          </BoxWrapper>
        </div>
      </div>
    </div>
  );
};

export default StudentDataTransfer;

interface StudentItemProps {
  data: {
    id: string;
    employeeCode?: string;
    fullName?: string;
    email?: string;
    departmentName?: string;
    avatar?: string;
  };
  onClick?: () => void;
  isSelected?: boolean;
  hideCheckbox?: boolean;
  viewOnly?: boolean;
  onRemove?: (itemId: string) => void;
}
const StudentItem: React.FC<StudentItemProps> = React.memo(
  ({ data, onClick, isSelected, viewOnly = false, onRemove, hideCheckbox = false }) => {
    const { id, employeeCode, fullName, email, departmentName } = data;
    return (
      <ListItemButton
        role="listitem"
        {...(!viewOnly ? { onClick } : { disableRipple: true, disableTouchRipple: true })}
        sx={(theme) => ({
          paddingInline: 2,
          paddingBlock: 1.5,
          borderRadius: 0,
          borderBottom: "1px solid",
          borderColor: theme.palette.grey[200],
        })}
      >
        <div className="flex items-center gap-2 flex-1">
          {!hideCheckbox ? (
            <ListItemIcon>
              <Checkbox checked={isSelected} tabIndex={-1} disableRipple />
            </ListItemIcon>
          ) : null}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Chip
                label={employeeCode}
                color="primary"
                variant="filled"
                sx={(theme) => ({
                  background: alpha(theme.palette.primary["main"], 0.1),
                  color: theme.palette.primary["dark"],
                  borderColor: "transparent",
                  borderRadius: "5px",
                  fontSize: "0.75rem",
                })}
              />
              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{fullName}</Typography>
            </div>
            <div className="flex gap-2">
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{departmentName}</Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{email}</Typography>
            </div>
          </div>
          {onRemove ? (
            <IconButton
              sx={(theme) => ({
                borderRadius: "8px",
                border: "1px solid",
                borderColor: theme.palette.grey[300],
                backgroundColor: "white",
              })}
              onClick={() => onRemove(id)}
              size="small"
              className="ml-auto"
            >
              <CloseIcon className="w-5 h-5" />
            </IconButton>
          ) : null}
        </div>
      </ListItemButton>
    );
  },
);

const hasSelected = (itemId: string, items: StudentSelectedItem[]) => {
  return items.some((it) => it.id === itemId);
};
