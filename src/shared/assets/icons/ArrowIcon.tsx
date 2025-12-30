import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M4 12H20M20 12L14 6M20 12L14 18" />
      </svg>
    </SvgIcon>
  );
};
export default ArrowRightIcon;
