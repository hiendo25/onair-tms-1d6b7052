import { redirect } from "next/navigation";

import { PATHS } from "@/constants/path.contstants";
const SurveysPage = async () => {
  redirect(PATHS.SURVEYS.LIST);
};

export default SurveysPage;
