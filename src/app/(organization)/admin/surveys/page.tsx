import { PATHS } from "@/constants/path.contstants";
import { redirect } from "next/navigation";
const SurveysPage = async () => {
  redirect(PATHS.SURVEYS.LIST);
};

export default SurveysPage;
