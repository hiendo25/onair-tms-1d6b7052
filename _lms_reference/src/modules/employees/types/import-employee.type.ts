import { HttpResponse } from "@/lib/api/http-status";
import { EmployeeParseItemWithValidate } from "@/services/employees/employee.dto";

export type EmployeeImportWithValidateResponse = HttpResponse<EmployeeParseItemWithValidate[]>;
