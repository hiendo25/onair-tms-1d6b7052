import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { resolveDocumentIcon } from "@/utils/format-file";

interface ClassRoomDocumentsProps {
  data: NonNullable<GetClassRoomBySlugResponse["data"]>;
}
const CARD_RADIUS = 16;
const ICON_SIZE = 48;
const DOCUMENT_SHADOW = "0px 10px 24px rgba(15, 23, 42, 0.08)";


const ClassRoomDocuments = ({ data }: ClassRoomDocumentsProps) => {
  const documents = data.resources ?? [];
  return (
    <Stack spacing={2}>
      <Typography component="h1" variant="h3" className="leading-9 text-[24px] md:leading-11 md:text-[26px]">
        Tài liệu
      </Typography>

      {documents.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Chưa có mục tiêu cho lớp học này.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {documents.map((doc, index) => {
            const resource = doc.resource;
            const Icon = resolveDocumentIcon(resource);

            return (
              <Card
                key={doc.id + index}
                variant="outlined"
                sx={{
                  borderRadius: `${CARD_RADIUS}px`,
                  borderColor: "divider",
                  boxShadow: DOCUMENT_SHADOW,
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <a
                    href={resource?.path || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer w-full h-full"
                  >
                    <Stack spacing={1.5}>
                      <Icon style={{ width: ICON_SIZE, height: ICON_SIZE }} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        className="line-clamp-2"
                        textOverflow={"ellipsis"}
                        sx={{ minHeight: 40 }}
                      >
                        {resource?.name || `Tài liệu ${index + 1}`}
                      </Typography>
                    </Stack>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Stack>
  );
};

export default ClassRoomDocuments;
