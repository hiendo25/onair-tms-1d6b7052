"use client";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Typography } from "@mui/material";
import { useCountdownDate } from "@/hooks/useCountdown";
import { useMarkAttendanceMutation } from "@/modules/class-room-management/operations/mutation";

interface ITimeCountDown {
	startDate: string;
	roomUrl: string;
	className?: string;
	classRoomId: string;
	classSessionId: string;
	employeeId?: string;
	shouldMarkAttendance?: boolean;
}

const TimeCountDown = ({
	startDate,
	roomUrl,
	className = "",
	classRoomId,
	classSessionId,
	employeeId,
	shouldMarkAttendance = true,
}: ITimeCountDown) => {
	const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
	const [hasTriggered, setHasTriggered] = useState(false);
	const countdownDate = useCountdownDate(new Date(dayjs(startDate).format()));

	const { mutateAsync: markAttendance } = useMarkAttendanceMutation();


	const days = parseInt(countdownDate.days, 10);
	const hours = parseInt(countdownDate.hours, 10);
	const minutes = parseInt(countdownDate.minutes, 10);
	const seconds = parseInt(countdownDate.seconds, 10);
	const { initialized } = countdownDate;

	useEffect(() => {
		if (startDate && countdownDate) {
			setIsSplashScreenVisible(false);
		}
	}, [startDate, countdownDate]);

	useEffect(() => {
		const shouldStart =
			days <= 0 &&
			hours <= 0 &&
			minutes <= 0 &&
			seconds <= 0 &&
			initialized &&
			roomUrl &&
			!hasTriggered;

		if (!shouldStart) {
			return;
		}

		const shouldCallMarkAttendance =
			shouldMarkAttendance &&
			Boolean(classRoomId && classSessionId && employeeId) &&
			!hasTriggered;

		const handleStart = async () => {
			setHasTriggered(true);
			if (shouldCallMarkAttendance) {
				try {
					await markAttendance({
						attendance_method: "online_auto",
						attendance_mode: "online",
						classRoomId,
						classSessionId,
						employeeId: employeeId!,
					});
				} catch (error) {
					console.error("Failed to mark attendance automatically", error);
				}
			}
			window.location.replace(roomUrl);
		};

		void handleStart();
	}, [
		days,
		hours,
		minutes,
		seconds,
		initialized,
		roomUrl,
		markAttendance,
		classRoomId,
		classSessionId,
		employeeId,
		hasTriggered,
		shouldMarkAttendance,
	]);

	return (
		<div
			className={`flex justify-around ${days > 0 ? "w-full" : "w-10/12"} items-center ${className}`}
		>
			{isSplashScreenVisible ? (
				<h1>loading.....</h1>
			) : (
				<>
					{days > 0 && (
						<section className="flex justify-between items-center flex-col w-10">
							<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
								{parseInt(countdownDate.days, 10) > 0 ? countdownDate.days : 0}
							</div>
							<Typography className="text-xs font-medium mt-2">Ngày</Typography>
						</section>
					)}

					{days > 0 && (
						<section className="self-start">
							<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
								:
							</div>
						</section>
					)}

					<section className="flex flex-col justify-between items-center w-10">
						<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
							{hours > 0 ? countdownDate.hours : "00"}
						</div>
						<Typography className="text-xs font-medium mt-2">Giờ</Typography>
					</section>

					<section className="self-start">
						<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
							:
						</div>
					</section>

					<section className="flex flex-col justify-between items-center w-10">
						<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
							{minutes > 0 ? countdownDate.minutes : "00"}
						</div>

						<Typography className="text-xs font-medium mt-2">Phút</Typography>
					</section>

					<section className="self-start">
						<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
							:
						</div>
					</section>

					<section className="flex flex-col justify-between items-center w-10">
						<div className="lg:text-6xl text-4xl md:font-extrabold font-bold text-primary text-[#0050FF]">
							{seconds > 0 ? countdownDate.seconds : "00"}
						</div>
						<Typography className="text-xs font-medium mt-2">Giây</Typography>
					</section>
				</>
			)}
		</div>
	);
};

export default TimeCountDown;
