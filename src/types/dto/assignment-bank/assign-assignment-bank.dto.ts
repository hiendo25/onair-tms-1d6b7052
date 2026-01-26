export class AssignAssignmentBankDto {
  assignmentId?: string;
  assignmentBankId!: string;
  organizationId!: string;
  startDate!: string;
  endDate!: string;
  attemptLimit!: number;
  assignedEmployeeIds!: string[];
}
