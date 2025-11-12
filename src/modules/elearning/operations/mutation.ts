import { useTMutation } from "@/lib";
import { elearningRepository } from "@/repository";

export const useDeleteElearningCourseMutation = () => {
    return useTMutation({
        mutationFn: (courseId: string) => elearningRepository.deleteElearningCourseById(courseId),
    });
};

export const useDeleteUserInElearningMutation = () => {
    return useTMutation({
        mutationFn: (payload: { courseId: string, studentsId: string[] }) => elearningRepository.deletePivotElearningCourseStudents(payload),
    });
};