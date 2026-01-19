import { Stack, Typography } from "@mui/material";

interface ClassRoomDescriptionsProps {
  description: string;
}

const ClassRoomDescriptions = ({ description }: ClassRoomDescriptionsProps) => {
  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[28px]">
        Nội dung lớp học
      </Typography>

      {!description ? (
        <Typography variant="body1" color="text.secondary">
          Chưa có nội dung cho lớp học này.
        </Typography>
      ) : (
        <div
          dangerouslySetInnerHTML={{
            __html: description || "<p>Chưa có nội dung lớp học</p>",
          }}
        />
      )}
    </Stack>
  );
};

export default ClassRoomDescriptions;
