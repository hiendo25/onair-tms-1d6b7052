import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
interface FooterProps {
  className?: string;
}
const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <Box component="footer" className="footer-wrapper" sx={{ px: { xs: 6, md: 6, xl: 8 }, py: 3 }}>
      <div className="flex items-center justify-center">
        <Typography className="text-center text-xs">
          Powered by{" "}
          <Link href="/">
            <strong>Onair TMS</strong>
          </Link>
        </Typography>
      </div>
    </Box>
  );
};
export default Footer;
