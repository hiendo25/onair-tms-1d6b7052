"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { ClassRoomPriorityDto } from "@/types/dto/classRooms/classRoom.dto";
import { useGetQRCodesByClassRoomQuery } from "@/modules/class-room-management/operation/qr-attendance";

interface QRCodeViewDialogProps {
  open: boolean;
  onClose: () => void;
  classRoom: ClassRoomPriorityDto;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SessionWithQR {
  id: string;
  title: string;
  start_at: string | null;
  end_at: string | null;
  is_online: boolean | null;
  location?: string | null;
  qrCode?: {
    id: string;
    qr_code: string;
    checkin_start_time?: string | null;
    checkin_end_time?: string | null;
  } | null;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`qr-tabpanel-${index}`}
      aria-labelledby={`qr-tab-${index}`}
      style={{ display: value === index ? 'block' : 'none' }}
      {...other}
    >
      <Box>{children}</Box>
    </div>
  );
}

const QRCodeViewDialog: React.FC<QRCodeViewDialogProps> = ({ open, onClose, classRoom }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const qrRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const qrCodeInstances = useRef<{ [key: string]: any }>({});

  // Fetch QR codes for this classroom
  const { data: qrCodesData, isLoading } = useGetQRCodesByClassRoomQuery(classRoom.id!);

  // Map sessions with their QR codes
  const sessionsWithQR: SessionWithQR[] = React.useMemo(() => {
    if (!classRoom.class_sessions || !qrCodesData?.data) return [];

    return classRoom.class_sessions
      .filter((session) => !session.is_online)
      .map((session) => {
        const qrCode = qrCodesData.data.find(
          (qr) => qr.class_session_id === session.id
        );
        return {
          id: session.id!,
          title: session.title!,
          start_at: session.start_at,
          end_at: session.end_at,
          is_online: session.is_online,
          location: session.location,
          qrCode: qrCode
            ? {
                id: qrCode.id,
                qr_code: qrCode.qr_code!,
                checkin_start_time: qrCode.checkin_start_time,
                checkin_end_time: qrCode.checkin_end_time,
              }
            : null,
        };
      })
      .filter((session) => session.qrCode);
  }, [classRoom.class_sessions, qrCodesData?.data]);

  // Generate QR code for a session
  const generateQRCode = async (sessionId: string, qrCode: string) => {
    if (!qrRefs.current[sessionId]) return;

    // Don't clear if already generated - just return
    if (qrCodeInstances.current[sessionId]) {
      return;
    }

    // Dynamically import QRCodeStyling
    const QRCodeStyling = (await import("qr-code-styling")).default;

    const qrCodeStyling = new QRCodeStyling({
      width: 220,
      height: 220,
      data: qrCode,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5,
      },
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      cornersSquareOptions: {
        color: "#000000",
        type: "extra-rounded",
      },
      cornersDotOptions: {
        color: "#000000",
        type: "dot",
      },
    });

    qrCodeInstances.current[sessionId] = qrCodeStyling;
    qrCodeStyling.append(qrRefs.current[sessionId]!);
  };

  // Generate all QR codes when dialog opens
  useEffect(() => {
    if (open && sessionsWithQR.length > 0) {
      // Generate QR codes for all sessions
      sessionsWithQR.forEach((session) => {
        if (session.qrCode?.qr_code) {
          // Wait a bit to ensure DOM is ready
          setTimeout(() => {
            if (qrRefs.current[session.id]) {
              generateQRCode(session.id, session.qrCode!.qr_code);
            }
          }, 150);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionsWithQR.length]);

  const handleDownloadQR = async (sessionId: string, sessionTitle: string) => {
    const qrInstance = qrCodeInstances.current[sessionId];
    if (!qrInstance) return;

    try {
      const blob = await qrInstance.getRawData("png");
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `QR-${sessionTitle || "session"}-${new Date().getTime()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (sessionsWithQR.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Mã QR điểm danh</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info">
            <AlertTitle>Không có mã QR</AlertTitle>
            Lớp học này không có buổi học offline nào hoặc chưa có mã QR được tạo.
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Mã QR lớp học
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {sessionsWithQR.length === 1 ? (
          // Single session - direct display
          <Box py={2}>
            {sessionsWithQR.map((session, index) => (
              <QRCodeSessionCard
                key={session.id}
                session={session}
                sessionIndex={index + 1}
                classRoom={classRoom}
                qrRef={(el) => (qrRefs.current[session.id] = el)}
                onDownload={() => handleDownloadQR(session.id, session.title)}
              />
            ))}
          </Box>
        ) : (
          // Multiple sessions - use tabs
          <>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              centered
              sx={{ borderBottom: 1, borderColor: "divider", justifySelf: "center" }}
            >
              {sessionsWithQR.map((session, index) => (
                <Tab key={session.id} label={`Buổi ${index + 1}`} />
              ))}
            </Tabs>

            {sessionsWithQR.map((session, index) => (
              <TabPanel key={session.id} value={selectedTab} index={index}>
                <QRCodeSessionCard
                  session={session}
                  sessionIndex={index + 1}
                  classRoom={classRoom}
                  qrRef={(el) => (qrRefs.current[session.id] = el)}
                  onDownload={() => handleDownloadQR(session.id, session.title)}
                />
              </TabPanel>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface QRCodeSessionCardProps {
  session: SessionWithQR;
  sessionIndex: number;
  classRoom: ClassRoomPriorityDto;
  qrRef: (el: HTMLDivElement | null) => void;
  onDownload: () => void;
}

const QRCodeSessionCard: React.FC<QRCodeSessionCardProps> = ({ session, sessionIndex, classRoom, qrRef, onDownload }) => {
  const now = new Date();
  const isExpired = session.qrCode?.checkin_end_time 
    ? new Date(session.qrCode.checkin_end_time) < now
    : false;
  const isActive = session.qrCode?.checkin_start_time && session.qrCode?.checkin_end_time
    ? new Date(session.qrCode.checkin_start_time) <= now && new Date(session.qrCode.checkin_end_time) >= now
    : true;

  return (
    <Box sx={{ py: 3 }}>
      <Box display="flex" flexDirection="column" gap={3}>
        {/* QR Code */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box
            ref={qrRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 220,
              minWidth: 220,
              bgcolor: "grey.50",
              borderRadius: 2,
              p: 2,
            }}
          />
          {/* Status Chip */}
          <Box display="flex" justifyContent="center" mt={2}>
            {isExpired ? (
              <Chip 
                label="Mã QR đã hết hiệu lực" 
                color="error" 
                size="small"
              />
            ) : isActive ? (
              <Chip 
                label="Đang điểm danh" 
                color="success" 
                size="small"
              />
            ) : (
              <Chip 
                label={`Buổi ${sessionIndex}`}
                color="default" 
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Information */}
        <Box sx={{ width: "100%" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom className="justify-self-center">
            {classRoom.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} className="justify-self-center">
            {session.title}
          </Typography>

          <Box sx={{ bgcolor: "grey.50", borderRadius: 2, p: 2 }}>
            {/* Mã lớp học */}
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Mã lớp học
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {classRoom.id || "N/A"}
              </Typography>
            </Box>

            {/* Mã định danh buổi học */}
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" display="block">
                Mã định danh buổi học
              </Typography>
              <Typography variant="body2" fontWeight="600" fontFamily="monospace">
                {session.qrCode?.qr_code || "N/A"}
              </Typography>
            </Box>

            {/* Địa điểm */}
            {session.location && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Địa điểm
                </Typography>
                <Typography variant="body2">
                  {session.location}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Download Button */}
          <Box mt={3}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={onDownload}
              className="float-right"
            >
              Tải QR
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default QRCodeViewDialog;
