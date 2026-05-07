import { HttpResponse } from "@/lib/api/http-status";
import { DeleteCourseResult } from "@/services/course/dto/delete-course.dto";

export type DeleteCourseResponse = HttpResponse<DeleteCourseResult>;
