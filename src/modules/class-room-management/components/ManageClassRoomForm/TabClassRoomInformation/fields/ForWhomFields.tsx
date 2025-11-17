"use client";
import { useCallback } from "react";

import { useFieldArray } from "react-hook-form";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { MarkerPinIcon, TrashIcon1 } from "@/shared/assets/icons";
import { Button, FormLabel, IconButton } from "@mui/material";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import BoxIcon from "../../TabClassRoomResource/BoxIcon";
import { useClassRoomFormContext } from "../../ClassRoomFormContainer";

const MAX_FIELD_COUNT = 4;
const MIN_FIELD_COUNT = 2;
interface ForWhomFieldsProps {
  className?: string;
}
const ForWhomFields: React.FC<ForWhomFieldsProps> = ({ className }) => {
  const { control, setValue, trigger } = useClassRoomFormContext();
  const {
    fields: forWhomFields,
    remove,

    append,
  } = useFieldArray({
    control,
    name: "forWhom",
    keyName: "_forWhomId",
  });
  const handleAddMore = useCallback(async () => {
    const fieldCount = forWhomFields.length;
    if (fieldCount > 0) {
      const isValidField = await trigger("forWhom");
      if (!isValidField) return;
    }

    if (fieldCount >= MAX_FIELD_COUNT) return;
    append([{ description: "" }, { description: "" }, { description: "" }, { description: "" }]);
  }, [forWhomFields]);

  return (
    <div className={className}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BoxIcon>
            <MarkerPinIcon />
          </BoxIcon>
          <FormLabel className="mb-0">Mục tiêu của lớp học</FormLabel>
        </div>
        {!forWhomFields.length ? (
          <Button onClick={handleAddMore} startIcon={<PlusIcon />} variant="fill" size="small">
            Thêm
          </Button>
        ) : (
          <IconButton size="small" className="p-0 bg-transparent mt-0.5" onClick={() => remove([0, 1, 2, 3, 4])}>
            <TrashIcon1 className="w-4 h-4" />
          </IconButton>
        )}
      </div>
      {forWhomFields.length ? (
        <div className="pt-4 flex flex-col gap-4">
          {forWhomFields.map((field, _index) => (
            <div className="for-whom-field flex" key={_index}>
              <RHFTextField
                name={`forWhom.${_index}.description`}
                placeholder={`Mục tiêu ${_index + 1}`}
                control={control}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
export default ForWhomFields;
