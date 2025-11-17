import { ChangeEventHandler, useEffect, useState } from "react";
import { cn } from "@/utils";
import useDebounce from "@/hooks/useDebounce";
import { useGetAssignmentsQuery } from "@/modules/assignment-management/operations/query";
import { Box, Button, FilledInput, FormHelperText, FormLabel, Popover, Typography } from "@mui/material";

export interface AssessmentSelectorProps {
  value?: string;
  onSelect?: (data: { id: string; title: string; description: string }) => void;
  className?: string;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}
const AssessmentSelector: React.FC<AssessmentSelectorProps> = ({
  value,
  onSelect,
  className,
  error,
  helperText,
  placeholder,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const debourceText = useDebounce(searchText, 600);
  const { data: assignments, isLoading } = useGetAssignmentsQuery({ search: debourceText });

  type AssignmentItem = Exclude<typeof assignments, undefined>["data"][number];
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentItem>();

  const handleSelect = (data: AssignmentItem) => () => {
    setSelectedAssignment(data);
    onSelect?.({ id: data.id, title: data.name, description: data.description });
    setAnchorEl(null);
  };

  const handleSearchText: ChangeEventHandler<HTMLInputElement> = (evt) => {
    setSearchText(evt.target.value);
  };

  const handleOpenDialogSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  useEffect(() => {
    if (!value && !assignments) return;

    const selectedItem = assignments?.data.find((item) => item.id === value);

    if (selectedItem) setSelectedAssignment(selectedItem);
  }, [value, assignments]);
  return (
    <div className={cn("assessment-selector", className)}>
      <FormLabel component="div">
        Bài kiểm tra <span className="text-red-600">*</span>
      </FormLabel>
      <div className="assignment-result py-2">
        {selectedAssignment ? (
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>{selectedAssignment.name}</Typography>
        ) : (
          <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
            {placeholder ? placeholder : "--"}
          </Typography>
        )}
      </div>
      {helperText && <FormHelperText error={!!error}>{helperText}</FormHelperText>}
      <Button variant="outlined" onClick={handleOpenDialogSelect} size="small">
        Chọn bài kiểm tra
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={() => ({
          ".MuiPaper-root": {
            width: "320px",
          },
        })}
      >
        <div className="box-assessment border rounded-lg border-gray-100">
          <div className="box-assessment__top px-3 py-2 border-b border-gray-100">
            <FilledInput size="small" value={searchText} onChange={handleSearchText} placeholder="Tìm kiếm" fullWidth />
          </div>
          <div className="box-assessment__body overflow-y-auto max-h-[300px]">
            {isLoading && (
              <div className="flex items-center justify-center p-6">
                <div>...Loading</div>
              </div>
            )}
            <Box
              sx={{
                scrollbarWidth: "thin",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                paddingInline: "8px",
                paddingBlock: "8px",
              }}
            >
              {assignments?.data.map((assignment) => (
                <div key={assignment.id} className="assessment-item">
                  <div
                    className={cn("cursor-pointer px-3 py-2 hover:bg-gray-100 rounded-md", {
                      "bg-gray-100": value === assignment.id,
                    })}
                    onClick={handleSelect(assignment)}
                  >
                    <Typography>{assignment.name}</Typography>
                  </div>
                </div>
              ))}
            </Box>
          </div>
          <div className="box-assessment__bottom"></div>
        </div>
      </Popover>
    </div>
  );
};
export default AssessmentSelector;
