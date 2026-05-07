import { AssignmentBankDto } from "@/types/dto/assignment-bank";

export type AssignmentSelectItem = Pick<AssignmentBankDto, "id" | "name"> & Record<string, any>;
