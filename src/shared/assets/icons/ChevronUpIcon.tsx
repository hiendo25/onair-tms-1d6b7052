import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const ChevronUpIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M18 15L12 9L6 15" />
      </svg>
    </SvgIcon>
  );
};

export default ChevronUpIcon;
