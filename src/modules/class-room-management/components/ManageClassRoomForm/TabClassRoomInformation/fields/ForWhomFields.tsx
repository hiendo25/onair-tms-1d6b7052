"use client";
import { useCallback } from "react";
import { Button, FormLabel, IconButton } from "@mui/material";
import { useFieldArray } from "react-hook-form";

import { MarkerPinIcon, TrashIcon1 } from "@/shared/assets/icons";
import PlusIcon from "@/shared/assets/icons/PlusIcon";
import RHFTextField from "@/shared/ui/form/RHFTextField";
import { useClassRoomFormContext } from "../../ClassRoomFormContainer";
import BoxIcon from "../../TabClassRoomResource/BoxIcon";

const MAX_FIELD_COUNT = 4;
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
    append([{ description: "" }]);
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
        <Button startIcon={<PlusIcon />} variant="fill" size="small" onClick={handleAddMore}>
          Thêm
        </Button>
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
              <IconButton size="small" className="p-0 bg-transparent" onClick={() => remove(_index)}>
                <TrashIcon1 className="w-4 h-4" />
              </IconButton>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
export default ForWhomFields;
