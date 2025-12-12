import { Button } from "@mui/material";
import Link from "next/link";

import { PATHS } from "@/constants/path.constant";
export default function Forbidden() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div>
        <h1>403 - Access Dened</h1>
        <p>You do not have permission to view this resource.</p>
        <Button LinkComponent={Link} href={PATHS.DASHBOARD}>
          Quay lai
        </Button>
      </div>
    </div>
  );
}
