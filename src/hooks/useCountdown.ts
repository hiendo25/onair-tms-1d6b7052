import React, { useCallback, useEffect, useRef, useState } from "react";

export type UseCountdownDateReturn = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  initialized: boolean;
};

export function useCountdownDate(date: Date): UseCountdownDateReturn {
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
    initialized: false,
  });

  useEffect(() => {
    setNewTime();
    const interval = setInterval(setNewTime, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setNewTime = () => {
    const startTime = date;

    const endTime = new Date();
    // plus 60 seconds
    const distanceToNow = startTime.valueOf() - endTime.valueOf();

    if (distanceToNow < 0) {
      setCountdown({
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
        initialized: true,
      });
      return;
    }

    const getDays = Math.floor(distanceToNow / (1000 * 60 * 60 * 24));

    const getHours = `0${Math.floor((distanceToNow % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}`.slice(-2);

    const getMinutes = `0${Math.floor((distanceToNow % (1000 * 60 * 60)) / (1000 * 60))}`.slice(-2);

    const getSeconds = `0${Math.floor((distanceToNow % (1000 * 60)) / 1000)}`.slice(-2);

    setCountdown({
      days: getDays < 10 ? `0${getDays}` : `${getDays}`,
      hours: getHours,
      minutes: getMinutes,
      seconds: getSeconds,
      initialized: true,
    });
  };

  return countdown;
}

// Usage
// const countdown = useCountdown(new Date('07/07/2022 21:30'));

// ----------------------------------------------------------------------

export type UseCountdownSecondsReturn = {
  counting: boolean;
  countdown: number;
  startCountdown: () => void;
  setCountdown: React.Dispatch<React.SetStateAction<number>>;
};

export function useCountdownSeconds(initCountdown: number): UseCountdownSecondsReturn {
  const [countdown, setCountdown] = useState(initCountdown);

  const remainingSecondsRef = useRef(countdown);

  const startCountdown = useCallback(() => {
    remainingSecondsRef.current = countdown;

    const intervalId = setInterval(() => {
      remainingSecondsRef.current -= 1;

      if (remainingSecondsRef.current === 0) {
        clearInterval(intervalId);
        setCountdown(initCountdown);
      } else {
        setCountdown(remainingSecondsRef.current);
      }
    }, 1000);
  }, [initCountdown, countdown]);

  const counting = initCountdown > countdown;

  return {
    counting,
    countdown,
    startCountdown,
    setCountdown,
  };
}

// Usage
// const { countdown, startCountdown, counting } = useCountdownSeconds(30);
interface UseCountdownDateReturnReturn {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}
export function useCountdownV2(endDate: Date): UseCountdownDateReturnReturn {
  const intervalRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const remainDateTime = endDate.getTime() - now.getTime();

      if (remainDateTime < 0) {
        intervalRef.current && clearInterval(intervalRef.current);
        return;
      }

      const days = Math.floor(remainDateTime / (1000 * 60 * 60 * 24));

      const hours = Math.floor((remainDateTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      const minutes = Math.floor((remainDateTime % (1000 * 60 * 60)) / (1000 * 60));

      const seconds = Math.floor((remainDateTime % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
      });
    }, 1000);

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [endDate]);

  const numberToStringDateTime = (value: number) => {
    return value >= 10 ? value.toString() : `0${value}`;
  };
  return {
    days: numberToStringDateTime(countdown.days),
    hours: numberToStringDateTime(countdown.hours),
    minutes: numberToStringDateTime(countdown.minutes),
    seconds: numberToStringDateTime(countdown.seconds),
  };
}
