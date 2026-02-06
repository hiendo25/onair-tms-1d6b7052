import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

const Gamefication: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...rest }) => {
  return (
    <SvgIcon>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M11.0007 10.9999L2.13811 8.65833C1.56791 10.8165 1.80477 13.1085 2.80425 15.1044C3.80372 17.1003 5.49713 18.6629 7.56677 19.4991L11.0007 10.9999ZM11.0007 10.9999L11.0967 1.83375C9.06243 1.81245 7.07891 2.46844 5.4585 3.6984C3.83809 4.92835 2.67287 6.66239 2.14634 8.62741L11.0007 10.9999ZM20.1673 10.9999C20.1673 16.0625 16.0633 20.1666 11.0007 20.1666C5.93805 20.1666 1.834 16.0625 1.834 10.9999C1.834 5.93731 5.93805 1.83325 11.0007 1.83325C16.0633 1.83325 20.1673 5.93731 20.1673 10.9999Z" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

    </SvgIcon>
  );
};
export default Gamefication;
