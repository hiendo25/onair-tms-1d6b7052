"use client";
import { useLinkStatus } from "next/link";
export default function LinkStatus() {
  const { pending } = useLinkStatus();
  console.log({ pending });
  return <>{pending ? "..pending" : ""}</>;
}
