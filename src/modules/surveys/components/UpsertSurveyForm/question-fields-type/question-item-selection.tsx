import {
	DndContext,
	DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Button, IconButton, Stack } from "@mui/material";
import { Iconify } from "@onair/minimal-ui/iconify";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { CreateSurveyFormFields } from "../../../survey-form.schema";

import React, { memo, useMemo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { PropsWithChildren } from "react";
import { cn } from "@onair/utils/cn";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Field } from "@onair/minimal-ui/hook-form";
import { SurveyFieldOptionType } from "@onair/repositories";

interface QuestionItemSelectionProps {
	className?: string;
	index: number;
	methods: UseFormReturn<CreateSurveyFormFields>;
	showFieldOther: boolean;
}

const QuestionItemSelection: React.FC<QuestionItemSelectionProps> = ({
	methods,
	index,
	showFieldOther = true,
}) => {
	const { getValues, control } = methods;
	const { fields, remove, move, insert } = useFieldArray({
		name: `fields.${index}.options`,
		control,
		keyName: "_fieldId",
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
	);

	const isAddedFieldOptionOther = useMemo(() => {
		return fields.some((item) => item.type === SurveyFieldOptionType.OTHER);
	}, [fields]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		const activeId = active.id;
		const overId = over?.id;
		if (!over || activeId === overId) return;
		const activeIndex = fields.findIndex(
			(field) => field._fieldId === activeId,
		);
		const overIndex = fields.findIndex((field) => field._fieldId === overId);
		move(activeIndex, overIndex);
	};

	const handleAddOption = (optionType: SurveyFieldOptionType) => {
		const { options } = getValues("fields")[index];
		const nextIndex = options.length;

		insert(nextIndex, {
			id: `option-${nextIndex + 1}`,
			label: "",
			type: optionType,
		});
	};

	return (
		<Box component="div">
			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<SortableContext
					items={fields.map((item) => item._fieldId)}
					strategy={verticalListSortingStrategy}
				>
					{fields.map((field, _indexOption) => (
						<OptionSortableItem key={field.id} id={field._fieldId}>
							<Box component="div" className="flex gap-2 w-full">
								{field.type === SurveyFieldOptionType.DEFAULT ? (
									<Field.Text
										type="text"
										required
										label={`Lựa chọn ${_indexOption + 1}`}
										name={`fields.${index}.options.${_indexOption}.label`}
										placeholder={`Nhập lựa chọn ${_indexOption + 1}`}
										fullWidth
									/>
								) : (
									<Field.Text
										type="text"
										label="Khác..."
										name={`fields.${index}.options.${_indexOption}.label`}
										placeholder="Khác..."
										disabled
										fullWidth
									/>
								)}
								<Box component="div" className="mt-3">
									<IconButton
										onClick={() => remove(_indexOption)}
										className="font-normal"
									>
										<Iconify
											icon="solar:trash-bin-trash-bold"
											className="text-red-500"
										/>
									</IconButton>
								</Box>
							</Box>
						</OptionSortableItem>
					))}
				</SortableContext>
			</DndContext>
			<div className="h-6"></div>
			<Stack direction="row" alignItems="center" spacing={1}>
				<Button
					variant="outlined"
					startIcon={<Iconify icon="ic:round-plus" />}
					className="text-primary-600"
					onClick={() => handleAddOption(SurveyFieldOptionType.DEFAULT)}
				>
					Thêm lựa chọn
				</Button>
				{!isAddedFieldOptionOther && showFieldOther ? (
					<>
						hoặc
						<Button
							variant="outlined"
							startIcon={<Iconify icon="ic:round-plus" />}
							className="text-primary-600"
							onClick={() => handleAddOption(SurveyFieldOptionType.OTHER)}
						>
							Tự nhập
						</Button>
					</>
				) : null}
			</Stack>
		</Box>
	);
};
export default memo(QuestionItemSelection);

interface OptionSortableItemProps extends PropsWithChildren {
	id: string;
}
const OptionSortableItem: React.FC<OptionSortableItemProps> = ({
	id,
	children,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			{...attributes}
			style={style}
			className={cn(
				"bg-white border border-transparent rounded-xl overflow-hidden py-3",
				{
					"border-blue-600": isDragging,
				},
			)}
		>
			<Box component="div" className="flex gap-6 flex-1">
				<DragIndicatorIcon
					{...listeners}
					style={{ cursor: "grab", color: "#1877F2" }}
					aria-label="Drag Handle"
					className="mt-3"
				/>
				<Box component="div" className="form-field flex-1">
					{children}
				</Box>
			</Box>
		</div>
	);
};
