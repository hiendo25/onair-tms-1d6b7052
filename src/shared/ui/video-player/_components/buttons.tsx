import Stack from "@mui/material/Stack";
import {
	FullscreenButton,
	MuteButton,
	PlayButton,
	SeekButton,
	Tooltip,
	TooltipPlacement,
	useMediaState,
} from "@vidstack/react";
import {
	FullscreenExitIcon,
	FullscreenIcon,
	MuteIcon,
	PauseIcon,
	PlayIcon,
	SeekBackward10Icon,
	SeekForward10Icon,
	VolumeHighIcon,
	VolumeLowIcon,
} from "@vidstack/react/icons";

import { cn } from "@/utils";


interface MediaButtonProps {
	tooltipPlacement: TooltipPlacement;
	className?: string;
}

export const iconClass = cn(
	"text-white",
	"w-8 h-8 md:w-[32px] md:h-[32px]"
);

export const buttonClass = cn(
	"inline-flex items-center justify-center relative",
	"w-10 h-10 md:w-[48px] md:h-[48px]",
	"rounded-xl hover:bg-white/10 transition-colors",
	"z-50 pointer-events-auto"
);

export const tooltipClass =
	"animate-out fade-out slide-out-to-bottom-2 data-[visible]:animate-in data-[visible]:fade-in data-[visible]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white parent-data-[open]:hidden";

export const Play = ({ tooltipPlacement, className }: MediaButtonProps) => {
	const isPaused = useMediaState("paused");
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<PlayButton className={cn(buttonClass, className)}>
					{isPaused ? <PlayIcon className={iconClass} /> :
						<PauseIcon className={iconClass} />}
				</PlayButton>
			</Tooltip.Trigger>
			<Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
				{isPaused ? "Phát" : "Tạm dừng"}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

export const mobileForwardBackwardClass = cn(
	"flex items-center justify-center",
	"w-[56px] h-[56px]",
	"p-[4px] px-[6px]",
	"rounded-lg",
	"bg-white/16 backdrop-blur-sm",
	"z-50 pointer-events-auto"
);

export const mobilePlayClass = cn(
	"flex items-center justify-center",
	"w-[100px] md:w-[80px] h-[56px]",
	"p-[4px] px-[10px]",
	"rounded-lg",
	"bg-white/16 backdrop-blur-sm",
	"z-50 pointer-events-auto"
);

export const PlayMobile = ({ tooltipPlacement }: MediaButtonProps) => {
	return (
		<Stack direction="row" spacing={1}>
			<BackwardButton tooltipPlacement={tooltipPlacement} className={mobileForwardBackwardClass} />
			<Play tooltipPlacement={tooltipPlacement} className={mobilePlayClass} />
			<ForwardButton tooltipPlacement={tooltipPlacement} className={mobileForwardBackwardClass} />
		</Stack>
	);
};

export const Seek = ({ tooltipPlacement, className }: MediaButtonProps) => {
	return (
		<>
			<BackwardButton tooltipPlacement={tooltipPlacement} className={className} />
			<ForwardButton tooltipPlacement={tooltipPlacement} className={className} />
		</>
	);
};

export const Mute = ({ tooltipPlacement }: MediaButtonProps) => {
	const volume = useMediaState("volume");
	const isMuted = useMediaState("muted");

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<MuteButton className={buttonClass}>
					{isMuted || volume == 0 ? (
						<MuteIcon className={iconClass} />
					) : volume < 0.5 ? (
						<VolumeLowIcon className={iconClass} />
					) : (
						<VolumeHighIcon className={iconClass} />
					)}
				</MuteButton>
			</Tooltip.Trigger>
			<Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
				{isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

export const BackwardButton = ({ tooltipPlacement, className }: MediaButtonProps) => {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<SeekButton className={cn(buttonClass, className)} seconds={-10}>
					<SeekBackward10Icon className={iconClass} />
				</SeekButton>
			</Tooltip.Trigger>
			<Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
				Lùi 10 giây
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

export const ForwardButton = ({ tooltipPlacement, className }: MediaButtonProps) => {
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<SeekButton className={cn(buttonClass, className)} seconds={10}>
					<SeekForward10Icon className={iconClass} />
				</SeekButton>
			</Tooltip.Trigger>
			<Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
				Tiến 10 giây
			</Tooltip.Content>
		</Tooltip.Root>
	);
};

export const Fullscreen = ({ tooltipPlacement, className }: MediaButtonProps) => {
	const isActive = useMediaState("fullscreen");

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>
				<FullscreenButton className={cn(buttonClass)}>
					{isActive ? (
						<FullscreenExitIcon className={cn(iconClass, className)} />
					) : (
						<FullscreenIcon className={cn(iconClass, className)} />
					)}
				</FullscreenButton>
			</Tooltip.Trigger>
			<Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
				{isActive ? "Thoát toàn màn hình" : "Toàn màn hình"}
			</Tooltip.Content>
		</Tooltip.Root>
	);
};
