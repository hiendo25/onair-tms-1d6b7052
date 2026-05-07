import { createServiceRoleClient } from "@/services";

import { UserInsert } from "./user.entity";

export const createUser = async (userInsert: UserInsert) => {
  const supabaseAdmin = await createServiceRoleClient();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userInsert.email,
    password: userInsert.password,
    email_confirm: true,
    app_metadata: {
      active_organization_id: userInsert.organizationId,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
};

export const deleteUser = async (userId: string) => {
  const supabaseAdmin = await createServiceRoleClient();
  const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId, true);
  if (error) {
    throw new Error(error.message);
  }
  return data.user;
};

export const getUserIdByEmail = async (email: string) => {
  const supabaseAdmin = await createServiceRoleClient();

  const { data, error } = await supabaseAdmin.rpc("get_user_id_by_email", { user_email: email });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

export const getUserIdsByEmails = async (emails: string[]) => {
  const supabaseAdmin = await createServiceRoleClient();
  const { data, error } = await supabaseAdmin.rpc("get_user_ids_by_emails", { p_emails: emails });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};
