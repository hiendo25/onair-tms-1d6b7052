import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const PlusIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M12 5V19M5 12H19" />
      </svg>
    </SvgIcon>
  );
};

export default PlusIcon;
