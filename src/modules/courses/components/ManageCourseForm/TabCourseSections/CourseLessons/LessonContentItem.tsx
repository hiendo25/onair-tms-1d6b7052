import { Control, useWatch } from "react-hook-form";
import { UpsertCourseFormData } from "../../upsert-course.schema";
import { Typography } from "@mui/material";
interface LessonContentItemProps {
  sectionIndex: number;
  lessonIndex: number;
  control: Control<UpsertCourseFormData>;
  onClick?: () => void;
}
const LessonContentItem: React.FC<LessonContentItemProps> = ({ sectionIndex, lessonIndex, control, onClick }) => {
  const title = useWatch({ control, name: `sections.${sectionIndex}.lessons.${lessonIndex}.title` });
  return (
    <div className="lesson-content h-full flex items-center flex-1 cursor-pointer" onClick={onClick}>
      <Typography sx={{ fontSize: "0.875rem" }}>{title}</Typography>
    </div>
  );
};
export default LessonContentItem;
