import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const GitIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M2.75 2.75V12.1C2.75 13.6401 2.75 14.4102 3.04973 14.9985C3.31338 15.5159 3.73408 15.9366 4.25153 16.2003C4.83978 16.5 5.60986 16.5 7.15 16.5H13.75M13.75 16.5C13.75 18.0188 14.9812 19.25 16.5 19.25C18.0188 19.25 19.25 18.0188 19.25 16.5C19.25 14.9812 18.0188 13.75 16.5 13.75C14.9812 13.75 13.75 14.9812 13.75 16.5ZM2.75 7.33333L13.75 7.33333M13.75 7.33333C13.75 8.85212 14.9812 10.0833 16.5 10.0833C18.0188 10.0833 19.25 8.85212 19.25 7.33333C19.25 5.81455 18.0188 4.58333 16.5 4.58333C14.9812 4.58333 13.75 5.81455 13.75 7.33333Z" />
      </svg>
    </SvgIcon>
  );
};
export default GitIcon;
