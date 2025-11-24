import { ClassSessionType } from "@/model/class-session.model";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { Stack, Typography } from "@mui/material";

interface IClassRoomType {
    sessionType?: ClassSessionType | null;
}

const SESSION_TYPE_CONFIG: Record<
    ClassSessionType,
    { label: string; color: string; background: string; Icon: typeof VideocamOutlinedIcon }
> = {
    online: {
        label: "Trực tuyến (Online)",
        color: "#9A3E1A",
        background: "rgba(255, 102, 43, 0.16)",
        Icon: VideocamOutlinedIcon,
    },
    offline: {
        label: "Trực tiếp (Offline)",
        color: "#6E05C6",
        background: "rgba(151, 35, 249, 0.24)",
        Icon: FmdGoodOutlinedIcon,
    },
    live: {
        label: "Phát trực tiếp (Live)",
        color: "rgb(245, 22, 6)",
        background: "rgba(245, 22, 6, 0.24)",
        Icon: LiveTvOutlinedIcon,
    },
};

const ClassRoomType = ({ sessionType }: IClassRoomType) => {
    const typeConfig = sessionType ? SESSION_TYPE_CONFIG[sessionType] : undefined;

    if (!typeConfig) {
        return (
            <Typography variant="body2" color="text.secondary">
                --
            </Typography>
        );
    }

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
};

export default ClassRoomType;