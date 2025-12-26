"use client";
import React, { memo, useMemo } from "react";
import { Box } from "@mui/material";
import Image from "next/image";

import { cn } from "@/utils";

export interface AvatarProps {
  src?: string | null;
  alt?: string | null;
  width?: number;
  height?: number;
  className?: string;
  variant?: "rounded" | "circle";
  size?: "small" | "medium" | "large";
}
const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  width = 40,
  height = 40,
  className,
  variant = "circle",
  size = "medium",
}) => {
  const [isError, setIsError] = React.useState(false);

  return (
    <div
      className={cn(
        "avatar",
        " overflow-hidden bg-gray-50",
        {
          "rounded-full": variant === "circle",
          "rounded-lg": variant === "rounded",
          "w-8 h-8": size === "small",
          "w-10 h-10": size === "medium",
          "w-12 h-12": size === "large",
        },
        className,
      )}
    >
      {src ? (
        <>
          {!isError ? (
            <Image
              src={src}
              loading="lazy"
              alt={alt ?? ""}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAQAAAAm93DmAAAAKElEQVR42u3MQQEAAAQEMNdP/zqE4LkFWKbrVYRCoVAoFAqFQqHwZgFbMDPhJtVwHwAAAABJRU5ErkJggg=="
              quality={100}
              width={width}
              height={height}
              className="p-1 max-w-full max-h-full"
              onError={(err) => {
                setIsError(true);
              }}
            />
          ) : (
            <AvatarName label={alt} />
          )}
        </>
      ) : (
        <AvatarName label={alt} />
      )}
    </div>
  );
};
export default memo(Avatar);

interface AvatarNameProps {
  label: string | null;
}
const AvatarName: React.FC<AvatarNameProps> = memo(({ label = "" }) => {
  const bgColor = useMemo(() => getColorFromName(label || ""), [label]);
  if (!label) return null;
  return (
    <Box
      component="div"
      className="w-full h-full flex items-center justify-center uppercase"
      sx={{ backgroundColor: bgColor }}
    >
      <span className="font-semibold text-sm">{label?.charAt(0)}</span>
    </Box>
  );
});
const getRandomColorHls = () => {
  const hue = Math.floor(Math.random() * 360);
  const h = (hue + (1 - Math.floor((Math.random() * 100) / 2)) * 12 + 360) % 360;
  const s = 60 + Math.random() * 15; // saturation 60-75
  const l = 78 + Math.random() * 6; // lightness 78-84
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
};
const getColorFromName = (name?: string) => {
  if (!name) return "hsl(210, 20%, 85%)";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 80%)`;
};
