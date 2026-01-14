import { createClient } from "@/services";

export const getClassQrCodeByCode = async (code: string) => {
  const supabase = createClient();
  return await supabase.from("class_qr_codes").select("*").eq("qr_code", code).single();
};
export type GetQrCodeByCodeResponse = Awaited<ReturnType<typeof getClassQrCodeByCode>>;

type getClassQRCodeDetailQueryParams = {
  classRoomId: string;
  qrCode: string;
  classSessionId: string;
};

export const getClassQRCodeDetail = async (queryParams: getClassQRCodeDetailQueryParams) => {
  const supabase = createClient();
  let query = supabase.from("class_qr_codes").select("*");

  const { classRoomId, qrCode, classSessionId } = queryParams;

  query = query.eq("qr_code", qrCode);

  if (classRoomId) {
    query = query.eq("class_room_id", classRoomId);
  }

  if (classSessionId) {
    query = query.eq("class_session_id", classSessionId);
  }

  return await query.maybeSingle();
};
