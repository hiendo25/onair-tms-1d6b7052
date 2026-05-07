import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const ClassLive: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon className={className}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_525_78765)">
          <rect width="44" height="44" rx="22" fill="#E4F8EC" />
          <rect x="-4" width="52" height="25" fill="white" fillOpacity="0.73" />
          <path d="M33 17.9314C33 17.3256 33 17.0226 32.8802 16.8824C32.7763 16.7607 32.6203 16.6961 32.4608 16.7086C32.2769 16.7231 32.0627 16.9373 31.6343 17.3657L28 21L31.6343 24.6343C32.0627 25.0627 32.2769 25.2769 32.4608 25.2914C32.6203 25.3039 32.7763 25.2393 32.8802 25.1176C33 24.9774 33 24.6744 33 24.0686V17.9314Z" stroke="#118D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 18.8C13 17.1198 13 16.2798 13.327 15.638C13.6146 15.0735 14.0735 14.6146 14.638 14.327C15.2798 14 16.1198 14 17.8 14H23.2C24.8802 14 25.7202 14 26.362 14.327C26.9265 14.6146 27.3854 15.0735 27.673 15.638C28 16.2798 28 17.1198 28 18.8V23.2C28 24.8802 28 25.7202 27.673 26.362C27.3854 26.9265 26.9265 27.3854 26.362 27.673C25.7202 28 24.8802 28 23.2 28H17.8C16.1198 28 15.2798 28 14.638 27.673C14.0735 27.3854 13.6146 26.9265 13.327 26.362C13 25.7202 13 24.8802 13 23.2V18.8Z" stroke="#118D57" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_525_78765">
            <rect width="44" height="44" rx="22" fill="white" />
          </clipPath>
        </defs>
      </svg>

    </SvgIcon>
  );
};
export default ClassLive;
