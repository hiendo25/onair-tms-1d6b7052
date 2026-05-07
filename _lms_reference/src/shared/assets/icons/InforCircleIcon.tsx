import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const InforCircleIcon: FC<SVGProps<SVGSVGElement>> = ({
  className,
  ...rest
}) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentcolor"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path
          d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
};

export default InforCircleIcon;
