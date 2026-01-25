import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const ZoomIcon: FC<SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C17.523 2 22 6.47695 22 12C22 17.523 17.523 22 12 22C6.47695 22 2 17.523 2 12C2 6.47695 6.47695 2 12 2Z"
          fill="url(#paint0_linear_367_6682)"
        />
        <path
          d="M6.5874 9.35915V13.3232C6.59131 14.2197 7.32334 14.9408 8.21592 14.9373H13.9944C14.1589 14.9373 14.2909 14.8052 14.2909 14.6447V10.6802C14.2874 9.78415 13.5554 9.06267 12.6624 9.06618H6.88389C6.71982 9.06618 6.5874 9.19821 6.5874 9.35915ZM14.6589 10.9052L17.0444 9.16267C17.2515 8.99118 17.4124 9.03415 17.4124 9.3447V14.6588C17.4124 15.0123 17.2159 14.9697 17.0444 14.8412L14.6589 13.1017V10.9052Z"
          fill="white"
        />
        <defs>
          <linearGradient
            id="paint0_linear_367_6682"
            x1="4.64961"
            y1="5.21953"
            x2="20.523"
            y2="17.2336"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4A8CFF" />
            <stop offset="1" stopColor="#23B7EC" />
          </linearGradient>
        </defs>
      </svg>
    </SvgIcon>
  );
};
export default ZoomIcon;
