"use client";
import React, {
  InputHTMLAttributes,
  KeyboardEventHandler,
  forwardRef,
  memo,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  MenuList,
  Typography,
  alpha,
  styled,
} from "@mui/material";
import type { BoxProps, ChipProps } from "@mui/material";
import { isArray } from "lodash";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useClickOutSide from "./useClickOutside";
import { CloseIcon } from "@/shared/assets/icons";

type Option<T> = { value: T; label: string } & Record<string, any>;

export type MultipleSelectFieldProps<T> = {
  options: Option<T>[];
  helperText?: string;
  optionField?: {
    value: string;
    label: string;
  };
  placeholder?: string;
  required?: boolean;
  value?: Option<T>["value"][];
  error?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
  isLoading?: boolean;
  onChange?: (value: Option<T>["value"][]) => void;
  onInputEnter?: (value: string) => void;
  onRemoveOptionItem?: (value: Option<T>["value"]) => void;
};
const MultipleSelectField = <T,>({
  options,
  value,
  label,
  error,
  disabled,
  className,
  helperText,
  optionField,
  placeholder,
  onChange,
  required,
  onInputEnter,
  isLoading,
  onRemoveOptionItem,
}: MultipleSelectFieldProps<T>) => {
  const fieldId = useId();

  const [selectedItem, setSelectedItem] = useState<Option<T>["value"][]>([]);
  const [searchInput, setSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpenSelectDropdown, setIsOpenSelectDropdown] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useClickOutSide(anchorRef, () => {
    setIsOpenSelectDropdown(false);
    if (inputRef.current) {
      inputRef.current.style.display = "none";
    }
  });

  const getOptionLabelWithOptionField = (option: Option<T>) => {
    if (!optionField) return option.label;
    const optionLabel = option[optionField.label];

    if (!optionLabel) throw new Error("Field Option Label is not in keys of Option");

    return optionLabel;
  };

  const getOptionValueWithOptionField = (option: Option<T>) => {
    if (!optionField) return option.value;

    const optionValue = option[optionField.value] as T;

    return optionValue ?? option.value;
  };

  const getOptionLabel = (value: Option<T>["value"]) => {
    const opt = optionField
      ? options.find((o) => o[optionField.value] === value)
      : options.find((o) => o.value === value);
    return opt ? getOptionLabelWithOptionField(opt) : "";
  };

  const handleSelectOptionItem = (option: Option<T>) => {
    const value = getOptionValueWithOptionField(option);
    setSelectedItem((prev) => {
      const prevArr = isArray(prev) ? prev : [];
      const exists = prevArr.includes(value);
      const newValue = exists ? prevArr.filter((v) => v !== value) : [...prevArr, value];
      onChange?.(newValue);
      return newValue;
    });
    inputRef.current?.focus();
  };

  const toggleSelectDropdown = () => {
    setIsOpenSelectDropdown((prevOpen) => {
      if (inputRef.current) {
        if (!prevOpen) {
          inputRef.current.style.display = "block";
          inputRef.current?.focus();
        } else {
          inputRef.current.style.display = "none";
        }
      }
      return !prevOpen;
    });
  };

  const handleDeleteItem = (value: T) => (evt: any) => {
    onRemoveOptionItem?.(value);
    setSelectedItem((prevSelectedItem) => {
      const indexValue = prevSelectedItem.findIndex((item) => value === value);
      if (indexValue !== -1) {
        const newItem = [...prevSelectedItem];
        newItem.splice(indexValue, 1);
        return newItem;
      }
      return prevSelectedItem;
    });
  };

  const renderSelectedValues = (selectedValue: Exclude<MultipleSelectFieldProps<T>["value"], undefined>) => {
    return (
      <>
        {selectedValue.map((item, _index) => (
          <CustomChip key={_index} label={getOptionLabel(item)} onDelete={handleDeleteItem(item)} />
        ))}
      </>
    );
  };

  const renderPlaceHolder = () => {
    return placeholder ? <Typography sx={{ fontSize: "0.875rem", opacity: 0.6 }}>{placeholder}</Typography> : null;
  };

  const handleInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.key === "Enter") {
      evt.preventDefault();
      const value = evt.currentTarget.value;
      if (!value.length) return;
      onInputEnter?.(value);
      setSearchInput("");
    }
  };
  const handleChangeInputSearch: InputHTMLAttributes<HTMLInputElement>["onChange"] = (evt) => {
    setSearchInput(evt.target.value);
  };

  const filterOptionBySearchInput = (options: Option<T>[]) => {
    return options.filter((opt) => opt.label.includes(searchInput));
  };
  const hasSelectedItem = (option: Option<T>) => {
    return isArray(selectedItem) ? selectedItem.some((it) => it === option.value) : option.value === selectedItem;
  };

  useEffect(() => {
    if (value) {
      setSelectedItem(value);
    }
  }, [value]);
  return (
    <FormControl disabled={disabled} error={!!error} className={className} sx={{ position: "relative" }}>
      {label ? (
        <FormLabel htmlFor={fieldId}>
          {label}
          {required ? <span className="ml-1 text-red-600">*</span> : null}
        </FormLabel>
      ) : null}
      <ChipSelectWraper className="chip-select" ref={anchorRef}>
        <ChipSelectBar onClick={toggleSelectDropdown}>
          <div className="flex flex-wrap gap-2">
            {selectedItem.length
              ? renderSelectedValues(selectedItem)
              : !isOpenSelectDropdown
              ? renderPlaceHolder()
              : null}
            <ChipSelectInput
              ref={inputRef}
              value={searchInput}
              onChange={handleChangeInputSearch}
              onKeyDown={handleInputKeyDown}
              id={fieldId}
            />
          </div>
          <ChipSelectArrowIcon isOpen={isOpenSelectDropdown} />
        </ChipSelectBar>
        <Dropdown isOpen={isOpenSelectDropdown}>
          <MenuList sx={{ gap: "2px" }}>
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
            {filterOptionBySearchInput(options).map((option, _index) => (
              <MenuItem
                key={_index}
                value={option.value?.toString()}
                onClick={() => handleSelectOptionItem(option)}
                sx={(theme) => ({
                  backgroundColor: hasSelectedItem(option) ? theme.palette.grey[200] : undefined,
                })}
              >
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </Dropdown>
      </ChipSelectWraper>
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
};
export default MultipleSelectField;

const CustomChip = styled(({ ...props }: ChipProps) => <Chip {...props} deleteIcon={<CloseIcon />} />)(({ theme }) => ({
  borderRadius: "6px",
  backgroundColor: alpha(theme.palette.primary["main"], 0.1),
  maxHeight: "24px",
  borderColor: "transparent",
  maxWidth: 180,
  "& .MuiChip-label": {
    color: theme.palette.primary["dark"],
    overflow: "hidden !important",
    display: "-webkit-box !important",
    WebkitBoxOrient: "vertical !important",
    WebkitLineClamp: "1 !important",
  },
}));

const ChipSelectBar = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  justifyContent: "space-between",
  minHeight: "42px",
  width: "100%",
  border: "1px solid",
  borderColor: theme.palette.grey[300],
  borderRadius: "8px",
  cursor: "pointer",
  padding: "0.375rem 0.875rem",
  paddingRight: "2rem",
}));
const ChipSelectWraper = styled(Box)(({ theme }) => ({
  position: "relative",
}));

const ChipSelectArrowIcon = styled(({ isOpen, ...restProps }: { isOpen: boolean }) => (
  <KeyboardArrowDownIcon {...restProps} fontSize="small" sx={{ transform: isOpen ? "rotateX(180deg)" : undefined }} />
))(({ theme }) => ({
  position: "absolute",
  right: 7,
  top: "calc(50% - 0.5em)",
  color: theme.palette.grey[600],
}));

const ChipSelectInput = styled(
  forwardRef<any, InputHTMLAttributes<HTMLInputElement>>((props, ref) => <input ref={ref} {...props} />),
)(() => ({
  minWidth: "120px",
  padding: "0px 0px",
  outline: "none",
  flex: 1,
  display: "none",
}));

const Dropdown = styled(({ isOpen, ...props }: BoxProps & { isOpen: boolean }) => (
  <Box {...props} sx={{ ...(!isOpen ? { display: "none" } : undefined) }} />
))(({ theme }) => ({
  position: "absolute",
  marginTop: "2px",
  left: 0,
  top: "100%",
  width: "100%",
  maxHeight: "350px",
  backgroundColor: "white",
  border: "1px solid",
  borderColor: theme.palette.grey[300],
  overflowY: "auto",
  zIndex: "10",
  boxShadow: "0px 6px 12px -6px rgb(0 0 0 / 10%), 0px 12px 18px -12px rgb(0 0 0 / 30%)",
  borderRadius: "8px",
}));
