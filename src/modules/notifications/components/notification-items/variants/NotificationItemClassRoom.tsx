import { Typography } from "@mui/material";
import Image from "next/image";

import { ImageIcon } from "@/shared/assets/icons";
import type { NotificationItemType } from "../notification-item.type";
import { NotificationItem } from "../NotificationItem";

export const NotificationItemClassRoom = ({
  data,
  className,
  onClick,
}: {
  data: NotificationItemType;
  className?: string;
  onClick?: () => void;
}) => {
  const { thumbnailUrl, title, description = "", rawData } = data;
  console.log({ rawData });
  const detailUrl = "";
  return (
    <NotificationItem.Root isRead={data.isRead} className={className} onClick={onClick}>
      <NotificationItem.Thumbnail>
        <div className="w-12 h-12 flex items-center justify-around bg-gray-100 rounded-xl overflow-hidden">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt="icon" width={100} height={100} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </div>
      </NotificationItem.Thumbnail>

      <NotificationItem.Content>
        <Typography
          component="h3"
          sx={{ fontSize: 14, fontWeight: 600 }}
          className="line-clamp-2 mb-1"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <div dangerouslySetInnerHTML={{ __html: description }} className="text-sm text-gray-600" />
      </NotificationItem.Content>
    </NotificationItem.Root>
  );
};
