import { Divider, Stack } from "@mui/material";
import { LogoOnairIcon } from "@/shared/assets/icons";

const PublicHeader = () => {
  return (
    <>
      <Stack direction="row" justifyContent="space-between" py={2} px={5}>
        <LogoOnairIcon className="h-10 w-auto" />
      </Stack>
      <Divider />
    </>
  );
};

export default PublicHeader;

