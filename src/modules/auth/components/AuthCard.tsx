import * as React from "react";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { LogoOnairIcon } from "@/shared/assets/icons";
export interface AuhCardProps extends React.PropsWithChildren {
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}
const AuhCard: React.FC<AuhCardProps> = ({
  children,
  title = "Sign up",
  description,
  className,
}) => {
  return (
    <Stack
      component="div"
      direction="column"
      justifyContent="space-between"
      sx={{ padding: 2 }}
      className={className}
    >
      <MuiCard
        variant="outlined"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignSelf: "center",
          width: "100%",
          gap: 2,
          margin: "auto",
          border: "none",
          padding: 0,
          overflow: "visible",
        }}
        className="bg-transparent"
      >
        <LogoOnairIcon className="w-auto h-12 mr-auto" />
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            component="p"
            variant="body1"
            className="text-sm text-gray-600"
          >
            {description}
          </Typography>
        ) : null}
        {children}
      </MuiCard>
    </Stack>
  );
};
export default React.memo(AuhCard);
