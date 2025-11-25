import React, { useMemo } from 'react';

import { Select, MenuItem, InputLabel, FormControl, FormHelperText, SelectChangeEvent } from '@mui/material';

interface OPTION {
    value: string,
    label: string,
    display: boolean,
}

interface PropTypes {
    inputLabel?: string;
    name?: string,
    value: string;
    onChange: (v) => void,
    error?: {
        message?: string,
    },
    options?: OPTION[] | undefined,
    className?: string,
    size?: "small" | "medium"
}

export const SelectOption: React.FC<PropTypes> = (props) => {
    const { inputLabel, value = '', name, onChange, error, options = [], size, ...others } = props;

    const labelId = `${name}-select-option`;

    const handleChange = React.useCallback((event: SelectChangeEvent) => {
        onChange(event.target.value);
    }, [onChange]);

    const renderMoreItem = useMemo(() => {
        if (options && options.length > 0) {
            return options.map((item, index) => {
                if (item.display) {
                    return <MenuItem key={`${item.value}_${index}`} value={item.value}>{item.label}</MenuItem>;
                }
            });
        }
        return null;
    }, [options]);

    return (
        <FormControl
            fullWidth
            error={!!error}
        >
            {inputLabel && <InputLabel id={labelId}>{inputLabel}</InputLabel>}
            <Select
                label={inputLabel}
                labelId={labelId}
                value={value}
                onChange={handleChange}
                {...others}
                size={size}
            >
                {renderMoreItem}
            </Select>
            {error?.message && <FormHelperText>{error?.message} </FormHelperText>}
        </FormControl>
    );
};
