import React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const IndiaFlag: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
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
        <g clipPath="url(#a)">
          <mask id="b" maskUnits="userSpaceOnUse" x="-4" y="0" width="32" height="24">
            <path d="M-4 0h32v24H-4V0Z" fill="#fff" />
          </mask>
          <g mask="url(#b)">
            <path fillRule="evenodd" clipRule="evenodd" d="M-4 0v24h32V0H-4Z" fill="#F7FCFF" />
            <mask id="c" maskUnits="userSpaceOnUse" x="-4" y="0" width="32" height="24">
              <path fillRule="evenodd" clipRule="evenodd" d="M-4 0v24h32V0H-4Z" fill="#fff" />
            </mask>
            <g mask="url(#c)" fillRule="evenodd" clipRule="evenodd">
              <path d="M-4 0v8h32V0H-4Z" fill="#FF8C1A" />
              <path d="M-4 16v8h32v-8H-4Z" fill="#5EAA22" />
              <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm7 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="#3D58DB" />
              <path
                d="m12 12.9-.6 3 .4-3-1.5 2.8 1.2-3L9.4 15l2-2.4-2.8 1.6 2.6-1.8-3 .7 3-1H8l3.2-.2-3-1 3 .8-2.6-1.9 2.8 1.7-2-2.5 2.1 2.3-1.2-3 1.5 2.9-.4-3.2.6 3.2.6-3.2-.4 3.2 1.5-2.8-1.2 2.9L14.6 9l-2 2.5 2.8-1.7-2.6 1.9 3-.8-3 1 3.2.1-3.2.1 3 1-3-.7 2.6 1.8-2.8-1.6 2 2.4-2.1-2.3 1.2 3-1.5-2.9.4 3.2-.6-3.1Z"
                fill="#3D58DB"
              />
            </g>
          </g>
        </g>
        <defs>
          <clipPath id="a">
            <rect width="24" height="24" rx="12" fill="#fff" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
};
export default IndiaFlag;
