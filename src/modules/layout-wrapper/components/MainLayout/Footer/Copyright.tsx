import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export default function Copyright() {
  return (
    <Typography variant="body2" sx={{ fontWeight: 600 }}>
      {"Copyright © "}
      <Link color="inherit" href="/">
        Onair TMS
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
