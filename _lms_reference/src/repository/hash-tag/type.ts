import { HashTag } from "@/model/hash-tag.model";

export type CreateClassRoomHashTagPayload = Pick<HashTag, "name" | "slug">;
