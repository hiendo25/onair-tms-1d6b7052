import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { FilePdfIcon } from "@/shared/assets/icons";

interface ClassRoomDocumentsProps {
  data: NonNullable<GetClassRoomBySlugResponse["data"]>;
}

const ClassRoomDocuments = ({ data }: ClassRoomDocumentsProps) => {

  if(data.resources.length === 0) {
    return (
      <Stack alignItems={"center"}>
        <Typography variant="h5" fontWeight="bold" mb={3} color="#002880">
          Tài liệu
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Chưa có tài liệu cho lớp học này.
        </Typography>
      </Stack>
    );
  }

  const documents = data.resources;


  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Tài liệu
      </Typography>
      <Stack gap={2} direction="row" flexWrap="wrap">
        {documents.map((doc, index) => (
          <div key={doc.id + index}>
            <Card sx={{ padding: "20px" }}>
              <CardContent>
                <a
                  href={doc.resource.path || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer w-full h-full"
                >
                  <FilePdfIcon style={{ height: 48, width: 48 }} />
                  <Typography
                    variant="body2"
                    textAlign="center"
                    mt={2}
                    maxWidth={230}
                    minWidth={230}
                    className="line-clamp-1"
                    textOverflow={"ellipsis"}
                    fontWeight={600}
                  >
                    {doc.resource.name || `Tài liệu ${index + 1}`}
                  </Typography>
                </a>
              </CardContent>
            </Card>
          </div>
        ))}
      </Stack>
    </Box>
  );
};

export default ClassRoomDocuments;
