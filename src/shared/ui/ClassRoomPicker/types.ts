import { Database } from "@/types/supabase.types";

export interface ClassRoomItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  room_type?: Database["public"]["Enums"]["class_session_type"];
  session_type?: Database["public"]["Enums"]["class_session_type"];
  sessions_count?: number;
  courses_count?: number;
}

export interface ClassRoomPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedClassRooms: ClassRoomItem[]) => void;
  initialSelected?: ClassRoomItem[];
  organizationId?: string;
  employeeId?: string;
  title?: string;
  multiple?: boolean;
}

