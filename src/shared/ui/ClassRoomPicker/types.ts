export interface ClassRoomItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
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

