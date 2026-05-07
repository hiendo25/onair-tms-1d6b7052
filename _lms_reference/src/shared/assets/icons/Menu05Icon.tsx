import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const Menu05Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
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
        <path d="M3 8.5H21M3 15.5H21" />
      </svg>
    </SvgIcon>
  );
};
export default Menu05Icon;
