import { Box, BoxProps, MenuItem, MenuList, styled } from "@mui/material";
import { isArray } from "lodash";

type Option<T> = { label: string; value: T } & Record<string, any>;
interface ChipSelectDropdownOptionsProps<T> {
  isOpen?: boolean;
  placeholder?: string;
  onOptionClick?: (option: Option<T>) => void;
  options: Option<T>[];
  selectedOption: Option<T>["value"] | Option<T>["value"][] | undefined;
}

const DropdownList = styled(({ isOpen, ...props }: BoxProps & { isOpen: boolean }) => (
  <Box {...props} sx={{ ...(!isOpen ? { display: "none" } : undefined) }} />
))(({ theme }) => ({
  position: "absolute",
  marginTop: "2px",
  left: 0,
  top: "100%",
  width: "100%",
  maxHeight: "350px",
  backgroundColor: "white",
  overflowY: "auto",
  zIndex: "10",
  boxShadow: "0px 6px 12px -6px rgb(0 0 0 / 10%), 0px 12px 18px -12px rgb(0 0 0 / 30%)",
  borderRadius: "8px",
}));

const ChipSelectDropdownOptions = <T,>({
  placeholder,
  options,
  isOpen = false,
  selectedOption,
  onOptionClick,
}: ChipSelectDropdownOptionsProps<T>) => {
  const hasSelectedItem = (option: Option<T>) => {
    return isArray(selectedOption) ? selectedOption.some((it) => it === option.value) : option.value === selectedOption;
  };

  return (
    <DropdownList isOpen={isOpen}>
      <MenuList>
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
          <MenuItem
            key={_index}
            value={option.value?.toString()}
            onClick={() => onOptionClick?.(option)}
            sx={(theme) => ({
              backgroundColor: hasSelectedItem(option) ? theme.palette.grey[200] : undefined,
            })}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </DropdownList>
  );
};

export default ChipSelectDropdownOptions;
