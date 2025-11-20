import { useGetCourseListQuery } from "../operations/query";
interface CourseSelectorProps {
  value: string;
  onChange: () => void;
}
const CourseSelector: React.FC<CourseSelectorProps> = () => {
  const courseList = useGetCourseListQuery();
  return <div>123</div>;
};
export default CourseSelector;
