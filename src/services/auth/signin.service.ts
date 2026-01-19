import dayjs from "dayjs";
import { cookies } from "next/headers";

import { authRepository, profilesRepository, userPreferenceRepository } from "@/repository";
import { employeesRepository } from "@/repository";
import { SignInDto, SignInDtoResponse } from "@/types/dto/auth/sign-in.dto";
import { DomainError } from "../DomainError";
import { createServiceRoleClient } from "../supabase/service-role-client";
export class SignInService {
  async execute(dto: SignInDto) {
    // const supabaseClient = await createSVClient();
    const supabaseAdmin = await createServiceRoleClient();

    const { email, password } = dto;

    const emailExists = await authRepository.checkEmailExists({ email });

    if (emailExists) {
      throw new DomainError("Email đã có trên hệ thông", "AUTH_EMAIL_EXISTS", 409);
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new DomainError("Signin failed", "SIGN_IN_WITH_PASSWORD_FAILED", 300);
    }

    const userReference = await userPreferenceRepository.getUserPreferencesByUserId(user.id);

    const { data, error: errorUpdateMetadataUser } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        active_organization_id: userReference.data?.default_organization_id,
      },
    });

    if (errorUpdateMetadataUser) {
      console.error(errorUpdateMetadataUser.message);
    }

    return {
      ...user,
      app_metadata: {
        ...user.app_metadata,
        active_organization_id: userReference.data?.default_organization_id,
      },
    };
  }
}
