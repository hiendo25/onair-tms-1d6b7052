import { Paper } from "@mui/material";

import SignUp, { SignUpProps } from "@/modules/auth/components/SignUp";
import PageAuthContainer from "../_components/PageAuthContainer";

const SignUpPage = () => {
  return (
    <PageAuthContainer>
      <SignUp />
    </PageAuthContainer>
  );
};
export default SignUpPage;
