import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const ClassOnline: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon className={className}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_525_78777)">
          <rect width="44" height="44" rx="22" fill="#EBF4FF" />
          <rect x="-4" width="52" height="25" fill="white" fillOpacity="0.73" />
          <path d="M17.5718 31C18.9066 30.3598 20.41 30 22 30C23.59 30 25.0934 30.3598 26.4282 31M16.8 27H27.2C28.8802 27 29.7202 27 30.362 26.673C30.9265 26.3854 31.3854 25.9265 31.673 25.362C32 24.7202 32 23.8802 32 22.2V17.8C32 16.1198 32 15.2798 31.673 14.638C31.3854 14.0735 30.9265 13.6146 30.362 13.327C29.7202 13 28.8802 13 27.2 13H16.8C15.1198 13 14.2798 13 13.638 13.327C13.0735 13.6146 12.6146 14.0735 12.327 14.638C12 15.2798 12 16.1198 12 17.8V22.2C12 23.8802 12 24.7202 12.327 25.362C12.6146 25.9265 13.0735 26.3854 13.638 26.673C14.2798 27 15.1198 27 16.8 27Z" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_525_78777">
            <rect width="44" height="44" rx="22" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
};
export default ClassOnline;
