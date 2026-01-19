import React from "react";
import { Box } from "@mui/material";

interface CertificatePreviewProps {
  frameUrl?: string | null;
  aspectRatio?: string;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  frameUrl,
  aspectRatio = "4 / 3",
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: aspectRatio,
        position: "relative",
        overflow: "hidden",
        bgcolor: "grey.100",
        backgroundImage: frameUrl ? `url(${frameUrl})` : "none",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Certificate image floating on top */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <img
          src="/assets/images/certificate-standard.png"
          alt="Certificate"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>
    </Box>
  );
};

export default CertificatePreview;
