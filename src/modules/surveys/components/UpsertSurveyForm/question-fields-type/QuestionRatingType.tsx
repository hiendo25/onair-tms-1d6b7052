import { Star01Icon } from "@/shared/assets/icons";
import { Box, Typography } from "@mui/material";

interface QuestionRatingTypeProps {
  index?: number;
  className?: string;
}
const QuestionRatingType: React.FC<QuestionRatingTypeProps> = () => {
  return (
    <Box component="div" className="flex w-full items-center justify-around max-w-xl mx-auto">
      {Array.from({ length: 5 }, (k, v) => (
        <Box component="div" className="text-center" key={v}>
          <Star01Icon className="fill-amber-400 stroke-0" />
          <Typography sx={{ fontSize: "0.875rem" }}>{v + 1}</Typography>
        </Box>
      ))}
    </Box>
  );
};
export default QuestionRatingType;
