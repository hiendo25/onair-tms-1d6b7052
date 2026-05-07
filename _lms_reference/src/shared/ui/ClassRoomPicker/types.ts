import { Database } from "@/types/supabase.types";

export interface ClassRoomSession {
  id: string;
  title: string;
  start_at?: string;
  end_at?: string;
  session_type?: Database["public"]["Enums"]["class_session_type"];
  channel_provider?: string;
  course?: {
    id: string;
    title: string;
  };
  teacher?: {
    id: string;
    full_name: string;
  };
}

export interface ClassRoomItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  room_type?: Database["public"]["Enums"]["class_room_type"];
  session_type?: Database["public"]["Enums"]["class_session_type"];
  sessions_count?: number;
  courses_count?: number;
  sessions?: ClassRoomSession[];
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

