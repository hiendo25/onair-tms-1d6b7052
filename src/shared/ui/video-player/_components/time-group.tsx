import { Time } from "@vidstack/react";

export const TimeGroup = () => {
  return (
    <div className="ml-1 md:ml-1.5 flex items-center text-xs md:text-sm font-medium text-white pr-2 md:pr-4">
      <Time className="time" type="current" />
      <div className="mx-0.5 md:mx-1 text-white/80">/</div>
      <Time className="time" type="duration" />
    </div>
  );
};
