import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const CloseIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 7L7 17M7 7L17 17" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </svg>
    </SvgIcon>
  );
};

export default CloseIcon;
