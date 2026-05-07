export const QR_ATTENDANCE_KEYS = {
  qrCodes: {
    all: ["qr-codes"] as const,
    byId: (id: string) => ["qr-codes", "detail", id] as const,
    byClassRoom: (classRoomId: string) => ["qr-codes", "class-room", classRoomId] as const,
    bySession: (sessionId: string) => ["qr-codes", "session", sessionId] as const,
  },

  attendances: {
    all: ["attendances"] as const,
    byClassRoom: (classRoomId: string) => ["attendances", "class-room", classRoomId] as const,
    bySession: (sessionId: string) => ["attendances", "session", sessionId] as const,
    byEmployee: (employeeId: string) => ["attendances", "employee", employeeId] as const,
    statsByQRCode: (qrCodeId: string) => ["attendances", "stats", qrCodeId] as const,
  },
} as const;
