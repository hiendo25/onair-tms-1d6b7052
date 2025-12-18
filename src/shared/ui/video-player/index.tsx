"use client";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "./video-layout.css";

import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Box, Typography } from "@mui/material";
import {
	MediaPlayer,
	MediaPlayerInstance,
	MediaProvider,
	Poster,
} from "@vidstack/react";
import {
	defaultLayoutIcons,
	DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import clsx from "clsx";

import { useResponsive } from "@/hooks/useResponsive";
import { isYoutubeVideo } from "@/utils/check-url";

import NextLessonOverlay from "./next-lesson-overlay";

interface VideoPlayerProps {
	videoUrl: string;
	title?: string;
	thumbnailUrl?: string;
	watermarkText?: string;
	initialTime?: number;
	initialPlaying?: boolean;
	onTimeUpdate?: (currentTime: number, isPlaying: boolean, duration: number) => void;
	nextLessonTitle?: string;
	onVideoEnd?: () => void;
	onStartNextLesson?: () => void;
	autoAdvanceTime?: number;
	onSeeking?: (seekTime: number) => void;
	onPause?: (pausedTime: number) => void;
	onEnded?: () => void;
	className?: string;
	instanceKey?: string | number;
}

const VideoPlayer = ({
	videoUrl,
	title,
	thumbnailUrl,
	watermarkText = "",
	initialTime = 0,
	initialPlaying = false,
	onTimeUpdate,
	nextLessonTitle,
	onVideoEnd,
	onStartNextLesson,
	autoAdvanceTime = 10,
	onSeeking,
	onEnded,
	onPause,
	className,
	instanceKey = 0,
}: VideoPlayerProps) => {
	const isMd = useResponsive("up", "md");
	const playerRef = useRef<MediaPlayerInstance>(null);
	const providerRef = useRef<HTMLDivElement>(null);

	const hasInitialSeeked = useRef<boolean>(false);
	const currentVideoUrl = useRef<string>("");

	const [letterbox, setLetterbox] = useState<{
		top: number;
		left: number;
		contentHeight: number;
		contentWidth: number;
	}>({ top: 0, left: 0, contentHeight: 0, contentWidth: 0 });

	const [showNextLessonOverlay, setShowNextLessonOverlay] = useState(false);

	// Compute letterboxing (black bars) so watermark stays within video content
	const computeLetterbox = useCallback(() => {
		const container = providerRef.current;
		if (!container) return;
		const videoEl = container.querySelector("video") as HTMLVideoElement | null;
		if (!videoEl) return;

		const rect = container.getBoundingClientRect();
		const cw = rect.width;
		const ch = rect.height;
		const vw = videoEl.videoWidth;
		const vh = videoEl.videoHeight;
		if (!vw || !vh || !cw || !ch) return;

		const videoAspect = vw / vh;
		const containerAspect = cw / ch;

		if (containerAspect > videoAspect) {
			// Bars on left/right
			const contentWidth = ch * videoAspect;
			const left = (cw - contentWidth) / 2;
			setLetterbox({ top: 0, left, contentHeight: ch, contentWidth });
		} else {
			// Bars on top/bottom
			const contentHeight = cw / videoAspect;
			const top = (ch - contentHeight) / 2;
			setLetterbox({ top, left: 0, contentHeight, contentWidth: cw });
		}
	}, []);

	const onVideoEndRef = useRef(onVideoEnd);
	const onStartNextLessonRef = useRef(onStartNextLesson);

	useEffect(() => {
		onVideoEndRef.current = onVideoEnd;
		onStartNextLessonRef.current = onStartNextLesson;
	}, [onVideoEnd, onStartNextLesson]);

	useEffect(() => {
		const container = providerRef.current;
		if (!container) {
			return;
		}
		const videoEl = container.querySelector("video") as HTMLVideoElement | null;

		const onLoadedMetadata = () => {
			computeLetterbox();
		};
		const onResize = () => computeLetterbox();
		const onVideoEnded = () => {
			if (nextLessonTitle && onStartNextLessonRef.current) {
				setShowNextLessonOverlay(true);
				onVideoEndRef.current?.();
			}
		};

		if (videoEl) {
			videoEl.addEventListener("loadedmetadata", onLoadedMetadata);
			videoEl.addEventListener("ended", onVideoEnded);
		}

		// Observe size changes of the provider container
		const ro = new ResizeObserver(onResize);
		ro.observe(container);

		// Initial measure (in case metadata already loaded)
		computeLetterbox();

		return () => {
			if (videoEl) {
				videoEl.removeEventListener("loadedmetadata", onLoadedMetadata);
				videoEl.removeEventListener("ended", onVideoEnded);
			}
			ro.disconnect();
		};
		// Only depend on nextLessonTitle to avoid infinite re-renders
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nextLessonTitle]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player || !videoUrl) return;

		const handleCanPlay = () => {
			if (initialTime > 0) {
				player.currentTime = initialTime;
			}

			if (initialPlaying) {
				player.play().catch((error) => {
					console.warn("Auto-play prevented:", error);
					onTimeUpdate?.(player.currentTime, false);
				});
			}
		};

		const handleError = (event: Event) => {
			console.warn("Video player error:", event);
		};

		player.addEventListener("can-play", handleCanPlay, { once: true });
		player.addEventListener("error", handleError);

		return () => {
			player.removeEventListener("can-play", handleCanPlay);
			player.removeEventListener("error", handleError);
		};
	}, [videoUrl, initialTime, initialPlaying, onTimeUpdate]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player || !initialPlaying) return;

		const timer = setTimeout(() => {
			player.play().catch((error) => {
				console.warn("Delayed auto-play failed:", error);
			});
		}, 100);

		return () => clearTimeout(timer);
	}, [initialPlaying]);

	useEffect(() => {
		const player = playerRef.current;
		if (!player || !onTimeUpdate) {
			return;
		}

		const handleTimeUpdate = () => {
			const duration = player.state.duration ?? 0;
			onTimeUpdate(player.currentTime, !player.paused, duration);
		};

		const handlePlay = () => {
			const duration = player.state.duration ?? 0;
			onTimeUpdate(player.currentTime, true, duration);
		};

		const handlePause = () => {
			const duration = player.state.duration ?? 0;
			onTimeUpdate(player.currentTime, false, duration);
		};

		player.addEventListener("time-update", handleTimeUpdate);
		player.addEventListener("play", handlePlay);
		player.addEventListener("pause", handlePause);

		return () => {
			player.removeEventListener("time-update", handleTimeUpdate);
			player.removeEventListener("play", handlePlay);
			player.removeEventListener("pause", handlePause);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoUrl]);

	const isYoutubeVideoUrl = useMemo(() => {
		return isYoutubeVideo(videoUrl);
	}, [videoUrl]);

	const handleStartNextLesson = useCallback(() => {
		setShowNextLessonOverlay(false);
		onStartNextLessonRef.current?.();
	}, []);

	const handlePauseAutoAdvance = useCallback(() => {}, []);

	const handleSeekToInitialTime = useCallback(() => {
		const player = playerRef.current;
		if (
			!player ||
			hasInitialSeeked.current ||
			!initialTime ||
			initialTime <= 0
		) {
			return;
		}

		try {
			const duration = player.state.duration;

			if (duration > 0 && initialTime >= duration) {
				console.warn(
					`Initial time ${initialTime}s exceeds video duration ${duration}s. Starting from beginning.`,
				);
				return;
			}

			player.remoteControl.seek(initialTime);
			hasInitialSeeked.current = true;

			console.log(`Video seeked to initial time: ${initialTime}s`);

			if (initialPlaying) {
				player.play().catch((error) => {
					console.warn(
						"Auto-play failed after seeking to initial time:",
						error,
					);
				});
			}
		} catch (error) {
			console.warn("Failed to seek to initial time:", error);
		}
	}, [initialTime, initialPlaying]);

	useEffect(() => {
		if (currentVideoUrl.current !== videoUrl) {
			hasInitialSeeked.current = false;
			currentVideoUrl.current = videoUrl;
		}
	}, [videoUrl]);

	const containerClassName = clsx(
		"relative w-full h-full aspect-video",
		className,
	);
	const mediaKey = `${videoUrl}-${instanceKey}`;

	return (
		<div className={containerClassName}>
			<MediaPlayer
				key={mediaKey}
				className="relative w-full h-full"
				src={videoUrl}
				viewType="video"
				streamType="on-demand"
				logLevel="silent"
				ref={playerRef}
				playsInline
				title={title}
				poster={thumbnailUrl}
				autoplay={initialPlaying}
				currentTime={initialTime}
				muted={false}
				preload="auto"
				onTimeUpdate={(e) => {
					if (onTimeUpdate && playerRef.current) {
						const duration = playerRef.current.state.duration ?? 0;
						onTimeUpdate(e.currentTime, !playerRef.current.paused, duration);
					}
				}}
				onPause={() => {
					if (onPause && playerRef.current) {
						onPause(playerRef.current.currentTime);
					}
				}}
				onSeeking={(seekTime) => {
					onSeeking?.(seekTime);
				}}
				onEnded={() => onEnded?.()}
				onLoadedMetadata={() => {
					// Seek to initial time once metadata is loaded and duration is available
					handleSeekToInitialTime();
				}}
				onCanPlay={() => {
					// Fallback: try to seek if metadata event didn't work
					if (!hasInitialSeeked.current) {
						handleSeekToInitialTime();
					}
				}}
			>
				{isYoutubeVideoUrl ? (
					<MediaProvider>
						<Poster className="vds-poster" />
					</MediaProvider>
				) : (
					<div
						ref={providerRef}
						className="relative block w-full h-full overflow-hidden"
					>
						<MediaProvider className="relative block w-full h-full overflow-hidden">
							<Poster className="vds-poster" />
						</MediaProvider>
						{watermarkText && (
							<Box
								sx={{
									position: "absolute",
									bottom: letterbox.top + letterbox.contentHeight * 0.08,
									right: letterbox.left + (isMd ? 16 : 8),
									padding: isMd ? "8px 12px" : "6px 8px",
									background: "rgba(122, 123, 125, 0.45)",
									backdropFilter: "blur(6px)",
									WebkitBackdropFilter: "blur(6px)",
									borderRadius: isMd ? "10px" : "8px",
									border: "1px solid rgba(170, 166, 166, 0.18)",
									boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
									opacity: 0.95,
									pointerEvents: "none",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									maxWidth: isMd ? "60%" : "70%",
									whiteSpace: "nowrap",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
								className="flex items-center justify-center absolute z-[10] pointer-events-none"
							>
								<Typography
									sx={{
										color: "#fff",
										fontWeight: 700,
										fontSize: isMd ? "14px" : "9px",
										lineHeight: 1.2,
										textShadow: "0 1px 2px rgba(0,0,0,0.5)",
									}}
									variant="body2"
								>
									{watermarkText}
								</Typography>
							</Box>
						)}
					</div>
				)}
				<DefaultVideoLayout
					icons={defaultLayoutIcons}
					slots={{
						googleCastButton: null,
					}}
				/>
				{showNextLessonOverlay && nextLessonTitle && (
					<NextLessonOverlay
						nextLessonTitle={nextLessonTitle}
						onStartNext={handleStartNextLesson}
						onPause={handlePauseAutoAdvance}
						autoAdvanceTime={autoAdvanceTime}
					/>
				)}
			</MediaPlayer>
		</div>
	);
};

export default VideoPlayer;
