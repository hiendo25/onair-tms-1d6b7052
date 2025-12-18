import React from "react";
import { TextFieldProps } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

import { InputDecimalField } from "./input-decimal-field";

interface RHFInputDecimalFieldProps extends Omit<TextFieldProps, "onChange"> {
	name: string;
}

export const RHFInputDecimalField: React.FC<RHFInputDecimalFieldProps> = ({
	name,
	InputProps,
	...other
}) => {
	const { control, setValue } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<InputDecimalField
					{...field}
					{...other}
					onChange={(value) =>
						setValue(name, value ? Number(value) : "", {
							shouldValidate: true,
						})
					}
					value={field.value ?? ""}
					error={!!error}
					helperText={error?.message}
					InputProps={{
						...InputProps,
					}}
				/>
			)}
		/>
	);
};
