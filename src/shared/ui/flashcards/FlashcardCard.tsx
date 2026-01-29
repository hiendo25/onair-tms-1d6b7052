"use client";

import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  listClasses,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";

import { EyeIcon } from "@/shared/assets/icons";

export interface FlashcardCardProps {
  id: string;
  name: string;
  imageUrl?: string;
  status?: "active" | "inactive";
  viewCount?: number;
  className?: string;
  extraTag?: string;
  isActive?: boolean;
  onToggle?: (id: string, isActive: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({
                                                       id,
                                                       name,
                                                       imageUrl,
                                                       status,
                                                       viewCount = 0,
                                                       className,
                                                       extraTag,
                                                       isActive = true,
                                                       onToggle,
                                                       onEdit,
                                                       onDelete,
                                                     }) => {
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggle?.(id, event.target.checked);
  };

  const handleEdit = (popupState: any) => () => {
    onEdit?.(id);
    popupState.close();
  };

  const handleDelete = (popupState: any) => () => {
    onDelete?.(id);
    popupState.close();
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height={160}
          image={imageUrl || "/images/placeholder-flashcard.png"}
          alt={name}
          sx={{
            objectFit: "cover",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Switch
            checked={isActive}
            onChange={handleToggle}
            size="small"
            sx={{
              "& .MuiSwitch-switchBase": {
                bgcolor: "transparent",
              },
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#fff",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#424242",
                opacity: 1,
              },
              "& .MuiSwitch-track": {
                bgcolor: "#bdbdbd",
                opacity: 1,
              },
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { paddingBottom: 2 } }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 1.5,
            minHeight: 48,
          }}
        >
          {name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
          {className && (
            <Chip
              label={className}
              color="default"
              size="small"
              sx={{
                borderRadius: 1,
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          )}
          {extraTag && (
            <Chip
              label={extraTag}
              size="small"
              sx={{
                borderRadius: 1,
                bgcolor: "primary.50",
                color: "primary.main",
                fontWeight: 500,
                fontSize: 12,
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <EyeIcon className="w-4 h-4" />
            <Typography variant="body2" color="text.secondary">
              {viewCount}
            </Typography>
          </Box>

          <PopupState variant="popover" popupId={`flashcard-menu-${id}`}>
            {(popupState) => (
              <>
                <IconButton
                  {...bindTrigger(popupState)}
                  size="small"
                  sx={{
                    width: 24,
                    height: 24,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <MoreVertIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Menu
                  {...bindMenu(popupState)}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  sx={{
                    p: 0,
                  }}
                  PaperProps={{
                    sx: {
                      [`& > .${listClasses.root}`]: {
                        p: 1,
                      },
                    },
                  }}
                >
                  <MenuItem onClick={handleEdit(popupState)} sx={{ py: 0.5, minHeight: 28 }}>
                    <Typography variant="body2">Chỉnh sửa</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleDelete(popupState)} sx={{ py: 0.5, minHeight: 28, color: "error.main" }}>
                    <Typography variant="body2">Xóa</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </PopupState>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FlashcardCard;
