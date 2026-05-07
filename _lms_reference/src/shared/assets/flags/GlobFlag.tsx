import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const GlobeFlag: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <g clipPath="url(#clip0_986_1789)">
          <circle cx="12" cy="12.5" r="12" fill="#007FFF" />
          <path
            d="M12 0.5C5.376 0.5 0 5.876 0 12.5C0 19.124 5.376 24.5 12 24.5C18.624 24.5 24 19.124 24 12.5C24 5.876 18.624 0.5 12 0.5ZM10.8 22.016C6.06 21.428 2.4 17.396 2.4 12.5C2.4 11.756 2.496 11.048 2.652 10.352L8.4 16.1V17.3C8.4 18.62 9.48 19.7 10.8 19.7V22.016ZM19.08 18.968C18.768 17.996 17.88 17.3 16.8 17.3H15.6V13.7C15.6 13.04 15.06 12.5 14.4 12.5H7.2V10.1H9.6C10.26 10.1 10.8 9.56 10.8 8.9V6.5H13.2C14.52 6.5 15.6 5.42 15.6 4.1V3.608C19.116 5.036 21.6 8.48 21.6 12.5C21.6 14.996 20.64 17.264 19.08 18.968Z"
            fill="#3EE07F"
          />
        </g>
        <defs>
          <clipPath id="clip0_986_1789">
            <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
};
export default GlobeFlag;
