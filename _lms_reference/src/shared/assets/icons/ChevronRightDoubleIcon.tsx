import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const ChevronRightDoubleIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M6 17L11 12L6 7M13 17L18 12L13 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </SvgIcon>
  );
};

export default ChevronRightDoubleIcon;
