import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const ClassOffline: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon className={className}>
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_525_78753)">
          <rect width="44" height="44" rx="22" fill="#F3E4FF" />
          <rect x="-4" width="52" height="25" fill="white" fillOpacity="0.73" />
          <path d="M19.5 21C21.7091 21 23.5 19.2091 23.5 17C23.5 14.7909 21.7091 13 19.5 13C17.2909 13 15.5 14.7909 15.5 17C15.5 19.2091 17.2909 21 19.5 21Z" fill="#F3E4FF" />
          <path d="M32 31V29C32 27.1362 30.7252 25.5701 29 25.126M25.5 13.2908C26.9659 13.8841 28 15.3213 28 17C28 18.6787 26.9659 20.1159 25.5 20.7092M27 31C27 29.1362 27 28.2044 26.6955 27.4693C26.2895 26.4892 25.5108 25.7105 24.5307 25.3045C23.7956 25 22.8638 25 21 25H18C16.1362 25 15.2044 25 14.4693 25.3045C13.4892 25.7105 12.7105 26.4892 12.3045 27.4693C12 28.2044 12 29.1362 12 31M23.5 17C23.5 19.2091 21.7091 21 19.5 21C17.2909 21 15.5 19.2091 15.5 17C15.5 14.7909 17.2909 13 19.5 13C21.7091 13 23.5 14.7909 23.5 17Z" stroke="#370363" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_525_78753">
            <rect width="44" height="44" rx="22" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </SvgIcon>
  );
};
export default ClassOffline;
