"use client";
import { useCallback } from "react";
import { useFieldArray } from "react-hook-form";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { TrashIcon1 } from "@/shared/assets/icons";
import { Button, FormLabel, IconButton } from "@mui/material";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";

const MAX_FIELD_COUNT = 4;
const MIN_FIELD_COUNT = 2;
interface BenefitsFieldsProps {
  className?: string;
}
const BenefitsFields: React.FC<BenefitsFieldsProps> = ({ className }) => {
  const { control, setValue, trigger } = useUpsertCourseFormContext();
  const {
    fields: BenefitsFields,
    remove,

    append,
  } = useFieldArray({
    control,
    name: "benefits",
    keyName: "_benefitId",
  });
  const handleAddMore = useCallback(async () => {
    const fieldCount = BenefitsFields.length;
    if (fieldCount > 0) {
      const isValidField = await trigger("benefits");
      if (!isValidField) return;
    }

    if (fieldCount >= MAX_FIELD_COUNT) return;
    append([{ content: "" }, { content: "" }, { content: "" }, { content: "" }]);
  }, [BenefitsFields]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FormLabel className="mb-0">Học viên được gì khi tham gia khoá học</FormLabel>
        </div>
        {!BenefitsFields.length ? (
          <Button onClick={handleAddMore} startIcon={<PlusIcon />} variant="fill" size="small">
            Thêm
          </Button>
        ) : (
          <IconButton size="small" className="p-0 bg-transparent mt-0.5" onClick={() => remove([0, 1, 2, 3, 4])}>
            <TrashIcon1 className="w-4 h-4" />
          </IconButton>
        )}
      </div>
      {BenefitsFields.length ? (
        <div className="pt-4 flex flex-col gap-4">
          {BenefitsFields.map((field, _index) => (
            <div className="for-whom-field flex" key={_index}>
              <RHFTextField
                name={`benefits.${_index}.content`}
                placeholder={
                  _index === 0
                    ? "Ví dụ: Học được cách cải thiện hiệu suất"
                    : _index === 1
                    ? "Ví dụ: Học được cách giao tiếp trong công việc"
                    : _index === 2
                    ? "Ví dụ: Học được cách phản xạ với thông tin"
                    : _index === 3
                    ? "Ví dụ: Học được cách xoay sở một mình"
                    : `Lợi ích ${_index + 1}`
                }
                control={control}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
export default BenefitsFields;
