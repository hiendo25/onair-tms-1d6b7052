"use client";
import React, {
  forwardRef,
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Badge, Button, SwipeableDrawer, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { isUndefined } from "lodash";

import { NotificationType } from "@/model/notification.model";
import { Inbox01Icon } from "@/shared/assets/icons";
import EmptyData from "@/shared/ui/EmptyData";
import { cn } from "@/utils";
import useInView from "@/utils/useInview";

type FilterOption = { label: string; value: NotificationType | "all"; count?: number };
export interface DrawerNotificationsRef {
  onOpen: () => void;
  onClose: () => void;
}

export interface NotificationDrawerProps<T> {
  loading?: boolean;
  open?: boolean;
  onClose?: () => void;
  items: T[];
  filterOptions: FilterOption[];
  disabledMarkAllRead?: boolean;
  isFetchingNext?: boolean;
  onFilterChange?: (option: FilterOption) => void;
  onMarkAllRead?: () => void;
  render: (item: T, index: number) => React.ReactNode;
  onFetchNext?: () => void;
}

function NotificationDrawer<T>(
  {
    onMarkAllRead,
    items,
    render,
    loading,
    filterOptions,
    onFilterChange,
    disabledMarkAllRead,
    open,
    onClose,
    onFetchNext,
    isFetchingNext,
  }: NotificationDrawerProps<T>,
  ref: React.ForwardedRef<DrawerNotificationsRef>,
) {
  const [activeKey, setActiveKey] = useState<NotificationType | "all">("all");
  const [openDrawer, setOpenDrawer] = useState(open);
  const handleOpen = useCallback(() => setOpenDrawer(true), []);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
      return;
    }
    setOpenDrawer(false);
  }, [onClose]);

  const onChangeSegment: NotificationSegmentsProps<FilterOption>["onChange"] = (value) => {
    const option = filterOptions.find((opt) => opt.value === value);
    if (option) onFilterChange?.(option);
    setActiveKey(value);
  };

  useEffect(() => {
    if (isUndefined(open)) return;
    setOpenDrawer(open);
  }, [open]);
  useImperativeHandle(ref, () => ({
    onOpen: handleOpen,
    onClose: handleClose,
  }));

  return (
    <SwipeableDrawer anchor="right" open={openDrawer} onClose={handleClose} onOpen={handleOpen}>
      <div className="min-h-screen overflow-hidden flex flex-col w-[420px]">
        <Toolbar className="block z-90 bg-white min-h-auto" sx={{ minHeight: "auto" }}>
          <div className="flex items-center justify-between w-full py-4 mb-4">
            <Typography variant="h6">Thông báo</Typography>
            <Button
              variant="text"
              className="p-0 h-auto hover:bg-white underline text-xs!"
              color="inherit"
              disableRipple
              onClick={onMarkAllRead}
              disabled={disabledMarkAllRead}
            >
              Đánh dấu đã đọc
            </Button>
          </div>
          <NotificationSegments<FilterOption>
            value={activeKey}
            items={filterOptions}
            onChange={onChangeSegment}
            render={(option) => (
              <SegmentItem
                key={option.value}
                label={option.label}
                active={activeKey === option.value}
                count={option.count ?? 0}
              />
            )}
          />
          <div className="notification-filter -mx-6 px-6 border-b-2 border-b-gray-200 -mt-0.5" />
        </Toolbar>
        <Box
          sx={{
            paddingBlock: 4,
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollBehavior: "smooth",
          }}
          role="presentation"
        >
          {loading && (
            <div className="loading-list px-8 flex flex-col gap-8">
              {Array.from({ length: 5 }, (k, v) => (
                <NotificationSkeletonItem key={v} />
              ))}
            </div>
          )}

          {!loading && !items.length ? (
            <EmptyData
              title="Trống"
              icon={<Inbox01Icon className="w-9 h-9 opacity-60" />}
              description="Bạn chưa có thông báo nào"
              iconSize="small"
            />
          ) : null}

          {!loading && items.length ? (
            <InfiniteScrollList onFetchNext={onFetchNext} isFetchingNext={isFetchingNext}>
              <div className="flex flex-col px-8 nin-h-[1000px]">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={cn("border-t border-dashed", {
                      "border-gray-200 pt-2 mt-2": index !== 0,
                      "border-transparent": index === 0,
                    })}
                  >
                    {render(item, index)}
                  </div>
                ))}
              </div>
            </InfiniteScrollList>
          ) : null}
        </Box>
      </div>
    </SwipeableDrawer>
  );
}

const DrawerNotifications = forwardRef(NotificationDrawer) as <T>(
  props: NotificationDrawerProps<T> & React.RefAttributes<DrawerNotificationsRef>,
) => React.ReactNode;

export default memo(DrawerNotifications) as typeof DrawerNotifications;

const NotificationSkeletonItem = () => {
  return (
    <div className="item flex gap-6 animate-pulse">
      <div className="w-12 h-12 bg-gray-200/60 rounded-lg"></div>
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-gray-200/60 rounded-lg"></div>
        <div className="h-3 bg-gray-200/60 w-[60%] rounded-lg"></div>
      </div>
    </div>
  );
};

const SegmentItem = ({ label, active, count }: { label: string; active?: boolean; count: number }) => {
  return (
    <Badge
      color="default"
      badgeContent={count}
      showZero
      component="div"
      slotProps={{
        badge: {
          sx: {
            position: "relative",
            background: active ? "black" : "rgba(0,0,0, 10%)",
            color: active ? "white" : "black",
            fontSize: 10,
            borderRadius: "6px",
            padding: 0,
            transform: "translate(0, 0)",
            marginLeft: 1,
          },
        },
      }}
      className="py-2 px-2 flex items-center cursor-pointer"
    >
      <Typography sx={{ fontWeight: 600, fontSize: 14, opacity: active ? 1 : 0.6, textTransform: "initial" }}>
        {label}
      </Typography>
    </Badge>
  );
};

interface NotificationSegmentsProps<T> extends PropsWithChildren {
  value?: NotificationType | "all";
  onChange?: (value: NotificationType | "all") => void;
  items: T[];
  render: (item: T) => React.ReactNode;
}
const NotificationSegments = <T extends { value: string }>({
  value,
  onChange,
  items,
  render,
}: NotificationSegmentsProps<T>) => {
  return (
    <Tabs
      value={value}
      onChange={(evt, value) => onChange?.(value as NotificationType | "all")}
      aria-label="notification stacks"
      variant="scrollable"
      scrollButtons={false}
      sx={{
        ".MuiButtonBase-root": {
          paddingInline: 0,
          paddingBlock: 0,
        },
      }}
    >
      {items.map((item) => (
        <Tab key={item.value} id={item.value} value={item.value} label={render(item)} disableRipple />
      ))}
    </Tabs>
  );
};

interface InfiniteScrollListProps extends PropsWithChildren {
  onFetchNext?: () => void;
  isFetchingNext?: boolean;
}
const InfiniteScrollList: React.FC<InfiniteScrollListProps> = ({ onFetchNext, children, isFetchingNext }) => {
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(loadMoreSentinelRef, { rootMargin: "0px 0px 100px 0px" });

  useEffect(() => {
    if (isFetchingNext || !isInView) return;

    onFetchNext?.();
  }, [isInView, isFetchingNext, onFetchNext]);

  return (
    <div>
      {children}
      {isFetchingNext ? (
        <div className="px-8 py-4">
          <NotificationSkeletonItem />
        </div>
      ) : null}
      <div ref={loadMoreSentinelRef} style={{ height: "1px" }} />
    </div>
  );
};
