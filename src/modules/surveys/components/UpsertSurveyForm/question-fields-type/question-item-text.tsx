import { Box, Typography } from "@mui/material";

interface QuestionItemTextProps {
	index?: number;
	className?: string;
}
const QuestionItemText: React.FC<QuestionItemTextProps> = () => {
	return (
		<Box component="div" className="py-3">
			<Typography component="p" className="text-gray-600">
				Văn bản câu trả lời ngắn
			</Typography>
		</Box>
	);
};
export default QuestionItemText;
