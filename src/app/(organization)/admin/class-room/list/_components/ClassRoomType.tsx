import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import LiveTvOutlinedIcon from "@mui/icons-material/LiveTvOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { Stack, Typography } from "@mui/material";

import { ClassSessionType } from "@/model/class-session.model";

interface IClassRoomType {
    sessionType?: ClassSessionType | null;
    roomType?: string;
}

const SESSION_TYPE_CONFIG: Record<
    ClassSessionType,
    { label: string; color: string; background: string; Icon: typeof VideocamOutlinedIcon }
> = {
    online: {
        label: "Online",
        color: "#64A9FF",
        background: "rgba(155, 206, 255, 0.28)",
        Icon: VideocamOutlinedIcon,
    },
    offline: {
        label: "Offline",
        color: "#FFB347",
        background: "rgba(255, 179, 71, 0.28)",
        Icon: FmdGoodOutlinedIcon,
    },
    live: {
        label: "Live",
        color: "#FF6B6B",
        background: "rgba(255, 107, 107, 0.28)",
        Icon: LiveTvOutlinedIcon,
    },
};

const ClassRoomType = ({ sessionType, roomType }: IClassRoomType) => {
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
                justifyContent: "center",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: background,
                color,
                width: 130
            }}
        >
            <Icon sx={{ width: 16, height: 16 }} />
            <Typography variant="caption" fontWeight={600} sx={{ color: "inherit" }}>
                {label} - {roomType}
            </Typography>
        </Stack>
    );
};

export default ClassRoomType;