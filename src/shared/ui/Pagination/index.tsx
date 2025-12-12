"use client";

import React from "react";

import {
	Pagination as PaginationMui,
	Stack,
	StackProps,
	Typography,
} from "@mui/material";

interface PropTypes {
	value?: number | string;
	take: number;
	total: number;
	onChange: (page: number) => void;
	showPaginationLabel?: boolean;
	name?: string;
	[key: string]: StackProps[keyof StackProps];
}

export const Pagination: React.FC<PropTypes> = (props) => {
	const {
		value = 1,
		onChange,
		showPaginationLabel = true,
		name = "sự kiện",
		take,
		total,
		...others
	} = props;

	return (
		<Stack
			direction={{ xs: "column", sm: "row" }}
			spacing={3}
			alignItems="center"
			justifyContent="space-between"
			{...others}
		>
			{showPaginationLabel && (
				<Typography variant="body2" color="text.secondary">
					{name}
				</Typography>
			)}
			<PaginationMui
				onChange={(e, page: number) => {
					onChange?.(page);
				}}
				count={(total % take === 0 ? 0 : 1) + Math.floor(total / take)}
				page={parseInt((value as string) ?? 1, 10)}
				boundaryCount={1}
			/>
		</Stack>
	);
};
