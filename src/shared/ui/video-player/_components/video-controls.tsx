import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Controls } from "@vidstack/react";

import { cn } from "@/utils";

import * as Buttons from "./buttons";
import * as Menus from "./menus";
import * as Sliders from "./sliders";
import { TimeGroup } from "./time-group";

interface VideoControlsProps {
    visible: boolean;
    isMobile?: boolean;
}

export const VideoControls = ({ visible, isMobile = false }: VideoControlsProps) => {
    if (isMobile) {
        return (
            <Controls.Root
                className={cn(
                    "absolute inset-0 z-30",
                    "transition-opacity duration-300",
                    visible ? "opacity-100" : "opacity-0"
                )}
            >
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                        <Buttons.PlayMobile tooltipPlacement="top" />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-auto">
                    <div className="w-full bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-8">
                        <Stack className="space-y-2">
                            <Stack direction="row" className="items-center justify-between">
                                <Box className="flex items-center gap-3 p-0">
                                    <TimeGroup />
                                </Box>
                                <Box className="flex items-center gap-3 p-0">
                                    <Buttons.Fullscreen tooltipPlacement="top" />
                                </Box>
                            </Stack>
                            <div className="pointer-events-auto">
                                <Sliders.TimeMobile />
                            </div>
                        </Stack>
                    </div>
                </div>
            </Controls.Root>
        );
    }

    return (
        <Controls.Root
            className={cn(
                "absolute inset-0 z-30 flex flex-col justify-end pointer-events-auto",
                "transition-opacity duration-300",
                visible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div className="relative z-40 px-4 pb-1">
                <Sliders.Time />
            </div>

            <div className="relative z-40 px-2 md:px-4 pb-2 md:pb-4 bg-gradient-to-t from-black/60 to-transparent">
                <Stack direction="row" className="items-center justify-between">
                    <Stack direction="row" spacing={{ xs: 1, md: 2 }} className="items-center">
                        <Box
                            className="z-50 flex items-center gap-1 md:gap-3 px-2 md:px-6 py-1 md:py-2.5 rounded-xl bg-white/16 backdrop-blur-sm"
                        >
                            <Buttons.Play tooltipPlacement="top" />
                        </Box>

                        <Box
                            className="z-50 flex items-center gap-1 md:gap-3 px-2 md:px-6 py-1 md:py-2.5 rounded-xl bg-white/16 backdrop-blur-sm"
                        >
                            <Buttons.Seek tooltipPlacement="top" />
                            <TimeGroup />
                        </Box>
                    </Stack>

                    <Box
                        className="z-50 flex items-center gap-1 md:gap-3 px-2 md:px-6 py-1 md:py-2.5 rounded-xl bg-white/16 backdrop-blur-sm"
                    >
                        <Buttons.Mute tooltipPlacement="top" />
                        <Menus.Settings placement="top" tooltipPlacement="top" />
                        <Buttons.Fullscreen tooltipPlacement="top" />
                    </Box>
                </Stack>
            </div>
        </Controls.Root>
    );
};
