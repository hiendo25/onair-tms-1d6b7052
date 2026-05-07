import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const ChevronSelectVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M7 15L12 20L17 15M7 9L12 4L17 9" />
      </svg>
    </SvgIcon>
  );
};
export default ChevronSelectVerticalIcon;
