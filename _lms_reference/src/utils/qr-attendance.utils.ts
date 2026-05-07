export interface QRCodeTimeValidation {
  checkin_start_time?: string | Date | null;
  checkin_end_time?: string | Date | null;
  class_start_at?: string | Date;
  class_end_at?: string | Date;
}

export interface TimeValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateQRCodeTimes = (data: QRCodeTimeValidation): TimeValidationResult => {
  const errors: string[] = [];

  const hasCheckinStart = data.checkin_start_time != null;
  const hasCheckinEnd = data.checkin_end_time != null;

  // If both are null, validation passes (no time restriction)
  if (!hasCheckinStart && !hasCheckinEnd) {
    return { isValid: true, errors: [] };
  }

  // Both are provided, validate them
  const checkinStart = new Date(data.checkin_start_time!);
  const checkinEnd = new Date(data.checkin_end_time!);

  // 1. Validate checkin_start_time < checkin_end_time
  if (checkinStart >= checkinEnd) {
    errors.push("Thời gian bắt đầu check-in phải nhỏ hơn thời gian kết thúc check-in");
  }

  // 2. Validate với thời gian lớp học/buổi học (nếu có)
  if (data.class_start_at && data.class_end_at) {
    const classStart = new Date(data.class_start_at);
    const classEnd = new Date(data.class_end_at);

    // checkin_start_time should be reasonable relative to class_start_at
    // const minCheckinStart = new Date(classStart.getTime() - 60 * 60 * 1000); // 1 hour before
    // if (checkinStart < minCheckinStart) {
    //   errors.push("Thời gian bắt đầu check-in không nên trước thời gian bắt đầu lớp quá 60 phút");
    // }

    // checkin_end_time <= class_end_at
    if (checkinEnd > classEnd) {
      errors.push("Thời gian kết thúc check-in phải trước hoặc bằng thời gian kết thúc lớp/buổi học");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};


export const generateDefaultQRCodeTimes = (
  classStartAt?: string | Date,
  classEndAt?: string | Date
): { checkin_start_time: string | null; checkin_end_time: string | null } => {
  if (!classStartAt || !classEndAt) {
    return {
      checkin_start_time: null,
      checkin_end_time: null,
    };
  }

  const classStart = new Date(classStartAt);

  // Check-in bắt đầu từ 30 phút trước lớp, kết thúc sau 1 giờ kể từ khi lớp bắt đầu
  const checkinStart = new Date(classStart.getTime() - 30 * 60 * 1000);
  const checkinEnd = new Date(classStart.getTime() + 60 * 60 * 1000);

  return {
    checkin_start_time: checkinStart.toISOString(),
    checkin_end_time: checkinEnd.toISOString(),
  };
};

export const isInCheckinTime = (
  checkinStart?: string | Date | null,
  checkinEnd?: string | Date | null
): boolean => {
  // If no checkin times, always allow checkin
  if (!checkinStart || !checkinEnd) {
    return true;
  }

  const now = new Date();
  const start = new Date(checkinStart);
  const end = new Date(checkinEnd);

  return now >= start && now <= end;
};

export const getRemainingCheckinTime = (checkinEnd?: string | Date | null): number => {
  if (!checkinEnd) {
    return 0; // No time limit
  }

  const now = new Date();
  const end = new Date(checkinEnd);
  const diff = end.getTime() - now.getTime();

  return Math.max(0, Math.floor(diff / 1000));
};

export const formatRemainingTime = (seconds: number): string => {
  if (seconds <= 0) return "Hết giờ";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const canActivateQRCode = (
  checkinStart?: string | Date | null,
  minutesBeforeCheckin: number = 15
): boolean => {
  // If no checkin time restriction, can always activate
  if (!checkinStart) {
    return true;
  }

  const now = new Date();
  const start = new Date(checkinStart);
  const allowedActivateTime = new Date(start.getTime() - minutesBeforeCheckin * 60 * 1000);

  return now >= allowedActivateTime;
};

export const getQRCodeTimeStatus = (
  checkinStart: string | Date | null | undefined,
  checkinEnd: string | Date | null | undefined,
  currentStatus: "inactive" | "active" | "expired" | "disabled"
): {
  canActivate: boolean;
  canCheckIn: boolean;
  isExpired: boolean;
  message: string;
} => {
  const now = new Date();

  // Handle case where there's no checkin time restriction
  if (!checkinStart || !checkinEnd) {
    const canActivate = currentStatus === "inactive";
    const canCheckIn = currentStatus === "active";
    const isExpired = currentStatus === "expired";

    let message = "";
    if (isExpired) {
      message = "QR code đã hết hạn";
    } else if (currentStatus === "disabled") {
      message = "QR code đã bị vô hiệu hóa";
    } else if (canCheckIn) {
      message = "Đang hoạt động (không giới hạn thời gian)";
    } else if (currentStatus === "inactive") {
      message = "QR code chưa được kích hoạt";
    }

    return { canActivate, canCheckIn, isExpired, message };
  }

  // Handle case with checkin time restriction
  const checkStart = new Date(checkinStart);
  const checkEnd = new Date(checkinEnd);

  const inCheckinTime = now >= checkStart && now <= checkEnd;
  const beforeCheckinTime = now < checkStart;
  const afterCheckinTime = now > checkEnd;

  const canActivate = canActivateQRCode(checkinStart) && !afterCheckinTime && currentStatus === "inactive";
  const canCheckIn = currentStatus === "active" && inCheckinTime;
  const isExpired = currentStatus === "expired" || afterCheckinTime;

  let message = "";
  if (currentStatus === "disabled") {
    message = "QR code đã bị vô hiệu hóa";
  } else if (afterCheckinTime) {
    message = "Đã hết giờ check-in";
  } else if (beforeCheckinTime) {
    message = "Chưa đến giờ check-in";
  } else if (canCheckIn) {
    message = "Đang trong giờ check-in";
  } else if (currentStatus === "inactive") {
    message = "QR code chưa được kích hoạt";
  } else if (currentStatus === "expired") {
    message = "QR code đã hết hạn";
  }

  return {
    canActivate,
    canCheckIn,
    isExpired,
    message,
  };
};
