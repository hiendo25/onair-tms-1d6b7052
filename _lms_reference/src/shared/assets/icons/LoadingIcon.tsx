import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const LoadingIcon: FC<SVGProps<SVGSVGElement>> = ({
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
        stroke="currentColor"
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path
          d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
};

export default LoadingIcon;
