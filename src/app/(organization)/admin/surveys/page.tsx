import { redirect } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
const SurveysPage = async () => {
  redirect(PATHS.SURVEYS.LIST);
};

export default SurveysPage;
