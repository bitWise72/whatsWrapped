// WhatsApp Analytics Engine - Deterministic stats calculation
import { ParsedMessage, UserStats, GroupStats, NarrativeContext } from "./types";

function getHour(timestamp: string): number {
  return new Date(timestamp).getHours();
}

function isNightOwlHour(timestamp: string): boolean {
  const hour = getHour(timestamp);
  return hour >= 0 && hour < 5;
}

function extractEmojis(text: string): string[] {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  return text.match(emojiRegex) || [];
}

function countCaps(text: string): { total: number; caps: number } {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  const capsLetters = text.replace(/[^A-Z]/g, "");
  return { total: letters.length, caps: capsLetters.length };
}

function calculateYapIndex(
  messageCount: number,
  avgLength: number,
  capsRatio: number
): number {
  // Yap Index formula: α*m + β*l + γ*c where α=1, β=0.5, γ=10
  return messageCount + 0.5 * avgLength + 10 * capsRatio;
}

export function calculateUserStats(
  messages: ParsedMessage[],
  author: string
): UserStats {
  const userMessages = messages.filter(
    (m) => m.author === author && m.type !== "system"
  );
  const textMessages = userMessages.filter((m) => m.type === "message");
  const mediaMessages = userMessages.filter((m) => m.type === "media");

  // Message counts
  const messageCount = textMessages.length;
  const mediaCount = mediaMessages.length;

  // Average message length
  const totalLength = textMessages.reduce((sum, m) => sum + m.content.length, 0);
  const avgMessageLength = messageCount > 0 ? totalLength / messageCount : 0;

  // Caps ratio
  let totalLetters = 0;
  let totalCaps = 0;
  for (const msg of textMessages) {
    const { total, caps } = countCaps(msg.content);
    totalLetters += total;
    totalCaps += caps;
  }
  const capsRatio = totalLetters > 0 ? totalCaps / totalLetters : 0;

  // Night owl ratio
  const nightMessages = userMessages.filter((m) => isNightOwlHour(m.timestamp));
  const nightOwlRatio = userMessages.length > 0 
    ? nightMessages.length / userMessages.length 
    : 0;

  // Average reply gap (simplified - time between consecutive messages from same user)
  let totalGap = 0;
  let gapCount = 0;
  const sortedMessages = [...userMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  for (let i = 1; i < sortedMessages.length; i++) {
    const gap =
      new Date(sortedMessages[i].timestamp).getTime() -
      new Date(sortedMessages[i - 1].timestamp).getTime();
    // Only count gaps less than 24 hours (reasonable conversation gaps)
    if (gap < 24 * 60 * 60 * 1000) {
      totalGap += gap;
      gapCount++;
    }
  }
  const avgReplyGapHours = gapCount > 0 ? totalGap / gapCount / (1000 * 60 * 60) : 0;

  // Top emojis
  const allEmojis: string[] = [];
  for (const msg of textMessages) {
    allEmojis.push(...extractEmojis(msg.content));
  }
  const emojiCounts = allEmojis.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topEmojis = Object.entries(emojiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji);

  // Yap Index
  const yapIndex = calculateYapIndex(messageCount, avgMessageLength, capsRatio);

  return {
    name: author,
    messageCount,
    mediaCount,
    avgMessageLength,
    capsRatio,
    nightOwlRatio,
    avgReplyGapHours,
    yapIndex,
    topEmojis,
  };
}

export function calculateGroupStats(messages: ParsedMessage[]): GroupStats {
  const nonSystemMessages = messages.filter((m) => m.type !== "system");
  const systemMessages = messages.filter((m) => m.type === "system");

  // Total counts
  const totalMessages = nonSystemMessages.filter((m) => m.type === "message").length;
  const totalMedia = nonSystemMessages.filter((m) => m.type === "media").length;

  // Busiest hour
  const hourCounts: Record<number, number> = {};
  for (let i = 0; i < 24; i++) hourCounts[i] = 0;
  for (const msg of nonSystemMessages) {
    const hour = getHour(msg.timestamp);
    hourCounts[hour]++;
  }
  const busiestHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "0";

  // Dead hours (less than 1% of messages)
  const threshold = nonSystemMessages.length * 0.01;
  const deadHours = Object.entries(hourCounts)
    .filter(([, count]) => count < threshold)
    .map(([hour]) => parseInt(hour));

  // Join/leave events
  const joinLeaveEvents = systemMessages.filter(
    (m) =>
      m.content.includes("joined") ||
      m.content.includes("left") ||
      m.content.includes("added") ||
      m.content.includes("removed")
  ).length;

  // Chaos spikes (days with unusually high activity)
  const dateCounts: Record<string, number> = {};
  for (const msg of nonSystemMessages) {
    const msgDate = new Date(msg.timestamp);
    // Skip invalid timestamps
    if (isNaN(msgDate.getTime())) continue;
    const date = msgDate.toISOString().split("T")[0];
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  }
  const dateCountValues = Object.values(dateCounts);
  const avgPerDay = dateCountValues.length > 0
    ? dateCountValues.reduce((a, b) => a + b, 0) / dateCountValues.length
    : 0;
  const chaosSpikes = Object.entries(dateCounts)
    .filter(([, count]) => count > avgPerDay * 2)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Date range
  const timestamps = messages.map((m) => new Date(m.timestamp).getTime());
  const start = new Date(Math.min(...timestamps)).toISOString();
  const end = new Date(Math.max(...timestamps)).toISOString();

  // Participants
  const participants = [
    ...new Set(
      messages.filter((m) => m.author !== "System").map((m) => m.author)
    ),
  ];

  return {
    totalMessages,
    totalMedia,
    busiestHour: parseInt(busiestHour),
    deadHours,
    joinLeaveEvents,
    chaosSpikes,
    dateRange: { start, end },
    participants,
  };
}

export function generateNarrativeContext(
  messages: ParsedMessage[]
): NarrativeContext {
  const groupStats = calculateGroupStats(messages);
  
  // Calculate stats for each participant
  const userStats = groupStats.participants.map((author) =>
    calculateUserStats(messages, author)
  );

  // Normalize yap indices
  const maxYap = Math.max(...userStats.map((u) => u.yapIndex), 1);
  for (const user of userStats) {
    user.yapIndex = user.yapIndex / maxYap;
  }

  // Sort by various metrics
  const sortedByYap = [...userStats].sort((a, b) => b.yapIndex - a.yapIndex);
  const sortedByReplyGap = [...userStats].sort(
    (a, b) => b.avgReplyGapHours - a.avgReplyGapHours
  );
  const sortedByNightOwl = [...userStats].sort(
    (a, b) => b.nightOwlRatio - a.nightOwlRatio
  );

  // Extract narrative elements
  const topYapper = sortedByYap[0]?.name || "Unknown";
  const ghostKing = sortedByReplyGap[0]?.name || "Unknown";
  const nightOwls = sortedByNightOwl
    .filter((u) => u.nightOwlRatio > 0.1)
    .slice(0, 3)
    .map((u) => u.name);

  // Drama count (messages with lots of caps or exclamation marks)
  const dramaMessages = messages.filter((m) => {
    if (m.type !== "message") return false;
    const caps = countCaps(m.content);
    const capsRatio = caps.total > 0 ? caps.caps / caps.total : 0;
    const hasManyExclamation = (m.content.match(/!/g) || []).length > 2;
    return capsRatio > 0.5 || hasManyExclamation;
  });
  const dramaCount = dramaMessages.length;

  // Chaos day
  const chaosDay = groupStats.chaosSpikes[0]?.date || "N/A";

  // Emoji signature (most common emoji in the group)
  const allEmojis: string[] = [];
  for (const msg of messages) {
    if (msg.type === "message") {
      allEmojis.push(...extractEmojis(msg.content));
    }
  }
  const emojiCounts = allEmojis.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const emojiSignature =
    Object.entries(emojiCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "💬";

  return {
    topYapper,
    ghostKing,
    nightOwls,
    dramaCount,
    chaosDay,
    emojiSignature,
    totalMessages: groupStats.totalMessages,
    participantCount: groupStats.participants.length,
    dateRange: groupStats.dateRange,
    busiestHour: groupStats.busiestHour,
    userStats,
    groupStats,
  };
}
