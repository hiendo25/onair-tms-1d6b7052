"use client";
import { Button } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useMarkAttendanceMutation } from "@/modules/class-room-management/operations/mutation";

interface IJoinButton {
	startDate: string;
	roomUrl: string;
	isOwner: boolean;
	classRoomId: string;
	classSessionId: string;
	employeeId?: string;
	shouldMarkAttendance?: boolean;
}

const JoinButton = ({
	startDate,
	roomUrl,
	isOwner,
	classRoomId,
	classSessionId,
	employeeId,
	shouldMarkAttendance = true,
}: IJoinButton) => {
	const [isJoining, setIsJoining] = useState(false);
	const { mutateAsync: markAttendance } = useMarkAttendanceMutation();

	const isTimeRestricted = useMemo(() => {
		if (isOwner) {
			return (
				new Date(new Date().getTime() + 60 * 60 * 1000) < new Date(startDate)
			);
		}
		return (
			new Date(new Date().getTime() + 10 * 60 * 1000) < new Date(startDate)
		);
	}, [isOwner, startDate]);

	const handleJoin = useCallback(async () => {
		if (isTimeRestricted || isJoining || !roomUrl) {
			return;
		}

		setIsJoining(true);

		try {
			if (shouldMarkAttendance && employeeId) {
				await markAttendance({
					attendance_method: "online_auto",
					attendance_mode: "online",
					classRoomId,
					classSessionId,
					employeeId,
				});
			}
		} catch (error) {
			console.error("Failed to mark attendance on join", error);
		} finally {
			window.location.replace(roomUrl);
		}
	}, [
		isTimeRestricted,
		isJoining,
		roomUrl,
		employeeId,
		markAttendance,
		classRoomId,
		classSessionId,
		shouldMarkAttendance,
	]);

	return (
		<Button
			disabled={isTimeRestricted || isJoining || !roomUrl}
			variant="contained"
			size="large"
			fullWidth
			className="w-40"
			onClick={handleJoin}
		>
			Vào lớp học
		</Button>
	);
};

export default JoinButton;
