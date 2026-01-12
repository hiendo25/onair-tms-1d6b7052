type SessionWithChannelInfo = {
  channel_info?: unknown | null;
} | null | undefined;

export const resolveJoinUrl = (session?: SessionWithChannelInfo) => {
  if (!session?.channel_info || typeof session.channel_info !== "object") {
    return null;
  }

  const channelInfo = session.channel_info as Record<string, unknown>;
  const urlCandidate = channelInfo["url"] ?? channelInfo["joinUrl"] ?? channelInfo["join_url"];

  return typeof urlCandidate === "string" ? urlCandidate : null;
};
