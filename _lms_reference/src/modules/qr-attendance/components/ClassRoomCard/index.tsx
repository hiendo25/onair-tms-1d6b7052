import React, { createContext, PropsWithChildren } from "react";

import { ClassRoomPlatformType } from "@/constants/class-room.constant";

type ClassRoomContextType = {
  title: string;
  description: string;
  thumnailUrl?: string;
  platform: ClassRoomPlatformType;
  startDate: string;
  endDate: string;
};

const ClassRoomCardContext = createContext<ClassRoomContextType | undefined>(undefined);

interface ClassRoomCardProviderProps extends PropsWithChildren {}
const ClassRoomCardProvider: React.FC<ClassRoomCardProviderProps> = ({ children }) => {
  return <ClassRoomCardContext.Provider value={undefined}>{children}</ClassRoomCardContext.Provider>;
};

interface ClassRoomCardProps {}

const ClassRoomCard = () => {
  return (
    <ClassRoomCardProvider>
      <div className="classroom-card"></div>
    </ClassRoomCardProvider>
  );
};
export default ClassRoomCard;
