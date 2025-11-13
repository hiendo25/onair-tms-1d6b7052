"use client";
import { useResponsive } from "@/hooks/useResponsive";
import { Image } from "@/shared/ui/Image";
import { Box, Container, Stack, Typography } from "@mui/material";
import { ClassRoomDetailBox } from "./ClassRoomDetailBox";
import ClassRoomJoin from "./ClassRoomJoin";
import { GetClassRoomBySlugResponse } from "@/repository/class-room";

interface ClassRoomHeaderProps {
  data: GetClassRoomBySlugResponse["data"];
  isAdminView?: boolean;
}

const ClassRoomHeader = ({ data, isAdminView }: ClassRoomHeaderProps) => {
  const mdDown = useResponsive("down", "md");
  return (
    <Box>
      <Box
        sx={{
          background: "linear-gradient(180deg, #dfe9ff 37.72%, rgb(255 255 255 / 57%) 100%)",
        }}
      >
        <Container component={Box} disableGutters={mdDown} position="relative">
          <Image
            src={data?.thumbnail_url}
            alt="banner"
            width="100%"
            height="auto"
            ratio="21/9"
            sx={{ borderRadius: { xs: 1, md: 3 } }}
          />
        </Container>
      </Box>

      <Box pt={{ xs: 2, md: 5 }} pb={{ xs: 0, md: 5 }}>
        <Container>
          <Stack direction="row" spacing={3}>
            <Stack
              sx={{
                maxWidth: (theme) => {
                  return {
                    md: `calc(100% - ${theme.spacing(49)})`,
                    xs: "100%",
                  };
                },
              }}
              spacing={3}
              flex={1}
            >
              <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[36px]">
                {data?.title}
              </Typography>
              <ClassRoomDetailBox data={data} />
            </Stack>
            <ClassRoomJoin data={data} isAdminView={isAdminView}/>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default ClassRoomHeader;
