import { AssignmentDto } from "@/types/dto/assignments";

export type AssignmentSelectItem = Pick<AssignmentDto, "id" | "name"> & Record<string, any>;
