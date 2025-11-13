import { Box } from "@mui/material";
import type { BoxProps } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { ClassRoomRuntimeStatusFilter } from "../types/types";
import { getClassRoomRuntimeStatusLabel } from "../utils/status";

type ClassRoomRuntimeStatusProps = Omit<BoxProps, "children"> & {
    runtimeStatus?: ClassRoomRuntimeStatusFilter;
};

const ClassRoomRuntimeStatus = ({
    runtimeStatus,
    sx,
    ...boxProps
}: ClassRoomRuntimeStatusProps) => {
    const currentStatus = runtimeStatus ?? null;

    const theme = useTheme();

    if (
        currentStatus === null ||
        currentStatus === ClassRoomRuntimeStatusFilter.All
    ) {
        return null;
    }

    const style = getRuntimeStatusStyle(currentStatus, theme);

    const baseSx: SxProps<Theme> = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        px: 1.5,
        py: 0.5,
        borderRadius: 1,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: style.borderColor ? `1px solid ${style.borderColor}` : "none",
    };

    const containerSx: SxProps<Theme> = Array.isArray(sx)
        ? [baseSx, ...sx]
        : sx
            ? [baseSx, sx]
            : baseSx;

    return (
        <Box component="span" sx={containerSx} {...boxProps}>
            {getClassRoomRuntimeStatusLabel(currentStatus)}
        </Box>
    );
};

export default ClassRoomRuntimeStatus;

const getRuntimeStatusStyle = (
    status: ClassRoomRuntimeStatusFilter,
    theme: Theme,
) => {
    const createStyle = (tone: string) => ({
        color: tone,
        backgroundColor: alpha(tone, 0.12),
        borderColor: alpha(tone, 0.28),
    });

    switch (status) {
        case ClassRoomRuntimeStatusFilter.Ongoing:
            return createStyle(theme.palette.success.main);
        case ClassRoomRuntimeStatusFilter.Today:
            return createStyle(theme.palette.primary.main);
        case ClassRoomRuntimeStatusFilter.Upcoming:
            return createStyle(theme.palette.info.main);
        case ClassRoomRuntimeStatusFilter.Draft:
            return createStyle(theme.palette.warning.main);
        case ClassRoomRuntimeStatusFilter.Past:
        default:
            return {
                color: theme.palette.grey[700],
                backgroundColor: alpha(theme.palette.grey[400], 0.24),
                borderColor: alpha(theme.palette.grey[500], 0.32),
            };
    }
};
