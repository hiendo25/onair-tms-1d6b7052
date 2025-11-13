import { Stack, Typography } from "@mui/material";
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';

interface IClassRoomType {
    isOnline: boolean;

}

const ClassRoomType = ({ isOnline }: IClassRoomType) => {

    if (typeof isOnline !== "boolean") {
        return (
            <Typography variant="body2" color="text.secondary">
                --
            </Typography>
        );
    }

    const typeConfig = isOnline
        ? {
            label: "Trực tuyến (Online)",
            color: "#9A3E1A",
            background: "rgba(255, 102, 43, 0.16)",
            Icon: VideocamOutlinedIcon,
        }
        : {
            label: "Trực tiếp (Offline)",
            color: "#6E05C6",
            background: "rgba(151, 35, 249, 0.24)",
            Icon: FmdGoodOutlinedIcon,
        };

    const { Icon, label, color, background } = typeConfig;

    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
                display: "inline-flex",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: background,
                color,
            }}
        >
            <Icon sx={{ width: 16, height: 16 }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: "inherit" }}>
                {label}
            </Typography>
        </Stack>
    );
}

export default ClassRoomType;