import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { FilePdfIcon } from "@/shared/assets/icons";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

interface ClassRoomDocumentsProps {
  data: GetClassRoomBySlugResponse["data"];
}

const ClassRoomDocuments = ({ data }: ClassRoomDocumentsProps) => {
  const documents = (data?.documents as any[]) || [];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Tài liệu
      </Typography>
      <Stack gap={2} direction="row" flexWrap="wrap">
        {documents.map((doc, index) => (
          <div key={doc.url + index}>
            <Card sx={{ padding: "20px" }}>
              <CardContent>
                <a
                  href={doc.url.startsWith("http") ? doc.url : `${process.env.NEXT_PUBLIC_STORAGE_URL}/${doc.url}`}
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
                    {doc.name || `Tài liệu ${index + 1}`}
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
