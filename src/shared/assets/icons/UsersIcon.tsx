import SvgIcon from "@mui/material/SvgIcon";
import type { FC, SVGProps } from "react";

const UsersIcon: FC<SVGProps<SVGSVGElement>> = ({
  className,
  ...rest
}) => {
  return (
    <SvgIcon>
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...rest}
      >
        <path d="M20.1667 19.25V17.4167C20.1667 15.7081 18.9982 14.2726 17.4167 13.8655M14.2084 3.01653C15.5521 3.56047 16.5 4.87787 16.5 6.41667C16.5 7.95547 15.5521 9.27287 14.2084 9.8168M15.5834 19.25C15.5834 17.5415 15.5834 16.6873 15.3043 16.0135C14.9321 15.1151 14.2183 14.4013 13.3199 14.0291C12.6461 13.75 11.7918 13.75 10.0834 13.75H7.33337C5.62492 13.75 4.7707 13.75 4.09687 14.0291C3.19843 14.4013 2.48463 15.1151 2.11248 16.0135C1.83337 16.6873 1.83337 17.5415 1.83337 19.25M12.375 6.41667C12.375 8.44171 10.7334 10.0833 8.70837 10.0833C6.68333 10.0833 5.04171 8.44171 5.04171 6.41667C5.04171 4.39162 6.68333 2.75 8.70837 2.75C10.7334 2.75 12.375 4.39162 12.375 6.41667Z" />
      </svg>
    </SvgIcon>
  );
};
export default UsersIcon;
