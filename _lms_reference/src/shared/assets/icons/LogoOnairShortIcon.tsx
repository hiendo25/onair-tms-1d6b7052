import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const LogoOnairShortIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  ...rest
}) => {
  return (
    <SvgIcon>
      <svg
        width="34"
        height="40"
        viewBox="0 0 34 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path
          d="M12.1456 8.88837C12.1456 5.69523 14.7342 3.10669 17.9273 3.10669C21.1204 3.10669 23.709 5.69523 23.709 8.88837V12.4271H12.1456V8.88837Z"
          fill="#99B9FF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.1385 18.0625V8.73353C23.1385 5.77372 20.7379 3.37432 17.7767 3.37432C14.8154 3.37432 12.4148 5.77372 12.4148 8.73353V18.0625C12.4148 21.0223 14.8154 23.4217 17.7767 23.4217C20.7379 23.4217 23.1385 21.0223 23.1385 18.0625ZM17.7767 0C12.9509 0 9.03882 3.91014 9.03882 8.73353V18.0625C9.03882 22.8859 12.9509 26.7961 17.7767 26.7961C22.6024 26.7961 26.5145 22.8859 26.5145 18.0625V8.73353C26.5145 3.91014 22.6024 0 17.7767 0Z"
          fill="url(#paint0_linear_7114_64472)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.7205 13.9806C32.706 13.9806 33.5048 14.7749 33.5048 15.7546V21.0768C33.5048 22.6422 32.972 24.2683 32.1822 25.8289C31.3834 27.407 30.2636 29.032 28.9503 30.6272C26.324 33.8172 22.8132 37.0219 19.1943 39.6571C18.652 40.052 17.9325 40.1104 17.333 39.8081C16.7334 39.5059 16.3557 38.8942 16.3557 38.2259V34.79C7.0059 33.8905 0.495178 25.9634 0.495178 16.5431C0.495178 15.5633 1.29404 14.7691 2.27948 14.7691C3.26493 14.7691 4.06379 15.5633 4.06379 16.5431C4.06379 24.8236 10.0404 31.3268 18.14 31.3268C19.1254 31.3268 19.9243 32.1211 19.9243 33.1009V34.5824C22.2823 32.6196 24.4613 30.4781 26.1888 28.3798C27.3909 26.9197 28.3465 25.514 28.9944 24.234C29.6512 22.9364 29.9362 21.8768 29.9362 21.0768V15.7546C29.9362 14.7749 30.7351 13.9806 31.7205 13.9806Z"
          fill="url(#paint1_linear_7114_64472)"
        />
        <defs>
          <linearGradient
            id="paint0_linear_7114_64472"
            x1="7.15816"
            y1="33.8056"
            x2="33.0502"
            y2="10.2247"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#99B9FF" />
            <stop offset="0.467649" stopColor="#0050FF" />
            <stop offset="1" stopColor="#9723F9" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_7114_64472"
            x1="3.56815"
            y1="41.5769"
            x2="33.3131"
            y2="15.8159"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#99B9FF" />
            <stop offset="0.461211" stopColor="#0050FF" />
            <stop offset="1" stopColor="#9723F9" />
          </linearGradient>
        </defs>
      </svg>
    </SvgIcon>
  );
};
export default LogoOnairShortIcon;
