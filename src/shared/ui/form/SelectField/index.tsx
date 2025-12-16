"use client";
import React, { memo, useCallback, useId } from "react";
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import type { SelectProps } from "@mui/material";
import { isArray, isNull, isUndefined } from "lodash";

type OptionType = { id: string | number; label?: string; [key: string]: any };
type ValueType = number | string | string[] | number[];

export type SelectFieldProps = SelectProps<ValueType> & {
  options: OptionType[];
  helperText?: string;
  optionField?: {
    value: string;
    label: string;
  };
  placeholder?: string;
  required?: boolean;
};

const SelectField = ({
  options,
  value: selectdValue,
  label,
  error,
  disabled,
  className,
  helperText,
  multiple = false,
  optionField,
  placeholder,
  name,
  onChange,
  required,
}: SelectFieldProps) => {
  const fieldId = useId();

  const getOptionLabelWithOptionField = useCallback(
    (option: OptionType) => {
      if (!optionField) return option?.label;

      const optionName = option[optionField.label];

      return typeof optionName === "string" || typeof optionName === "number" ? optionName : option?.label;
    },
    [optionField],
  );

  const getOptionValueWithOptionField = useCallback(
    (option: OptionType) => {
      if (!optionField) return option.id;

      const optionValue = option[optionField.value];
      return typeof optionValue === "string" || typeof optionValue === "number" ? optionValue : option.id;
    },
    [optionField],
  );

  const getOptionLabel = useCallback(
    (value: string | number | undefined) => {
      if (optionField) {
        const exists = options.find((o) => o[optionField.value] === value);
        return exists?.[optionField.label];
      }
      const exists = options.find((option) => option["id"] === value);
      return exists?.label;
    },
    [optionField, options],
  );

  const renderSelectedValues = (valueSelected: ValueType) => {
    if (isUndefined(valueSelected) || isNull(valueSelected) || (isArray(valueSelected) && !valueSelected.length)) {
      return placeholder ? <Typography sx={{ fontSize: "0.875rem", opacity: 0.6 }}>{placeholder}</Typography> : null;
    }

    if (multiple) {
      const valueList = (isArray(valueSelected) ? valueSelected : []) as string[] | number[];
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {valueList.map((item) => (
            <CustomChip key={item} label={getOptionLabel(item)} />
          ))}
        </Box>
      );
    }

    const optionItem = isArray(valueSelected) ? valueSelected[0] : valueSelected;

    return typeof optionItem === "string" || typeof optionItem === "number" ? (
      <CustomChip label={getOptionLabel(optionItem)} />
    ) : null;
  };

  const handleChange: SelectProps<ValueType>["onChange"] = (event) => {
    const {
      target: { value },
    } = event;

    if (multiple) {
      const arrValues = value && isArray(value) ? value : [];
      onChange?.(event, arrValues);
    } else {
      const singleValue = (value && typeof value === "string") || typeof value === "number" ? value : "";
      onChange?.(event, singleValue);
    }
  };

  const selectId = `select-multiple-chip-${name}`;

  return (
    <FormControl disabled={disabled} error={!!error} className={className}>
      {label ? (
        <FormLabel htmlFor={fieldId}>
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </FormLabel>
      ) : null}
      <Select
        id={selectId}
        multiple={multiple}
        value={selectdValue}
        displayEmpty
        onChange={handleChange}
        renderValue={renderSelectedValues}
        MenuProps={{
          PaperProps: {
            sx: (theme) => ({
              maxHeight: 250,
              width: 250,
              scrollbarWidth: "thin", // Firefox
              "&::-webkit-scrollbar": { width: 6 },
              "& .MuiMenuItem-root": {
                "&:hover": {
                  background: theme.palette.grey[200],
                },
                "&.Mui-selected": {
                  backgroundColor: `${theme.palette.grey[200]}`,
                  fontWeight: 600,
                },
              },
            }),
          },
        }}
      >
        {placeholder ? (
          <MenuItem
            disabled
            sx={{
              "&.Mui-disabled": {
                opacity: 0.6,
              },
            }}
          >
            {placeholder}
          </MenuItem>
        ) : null}

        {options.map((option, _index) => (
          <MenuItem key={_index} value={getOptionValueWithOptionField(option)}>
            {getOptionLabelWithOptionField(option)}
          </MenuItem>
        ))}
      </Select>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};
export default memo(SelectField);

const CustomChip = styled(Chip)(({ theme }) => ({
  borderRadius: "4px",
  maxHeight: "inherit",
  background: alpha(theme.palette.grey[300], 0.1),
  borderColor: alpha(theme.palette.grey[600], 0.6),
  "& .MuiChip-label": {
    color: theme.palette.grey[800],
  },
}));
