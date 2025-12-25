// WhatsApp Chat Types

export interface ParsedMessage {
  timestamp: string; // ISO string
  author: string; // "System" for system messages
  content: string;
  type: "message" | "media" | "system";
}

export interface UserStats {
  name: string;
  messageCount: number;
  mediaCount: number;
  avgMessageLength: number;
  capsRatio: number;
  nightOwlRatio: number; // messages between 00:00-05:00
  avgReplyGapHours: number;
  yapIndex: number;
  topEmojis: string[];
}

export interface GroupStats {
  totalMessages: number;
  totalMedia: number;
  busiestHour: number;
  deadHours: number[];
  joinLeaveEvents: number;
  chaosSpikes: { date: string; count: number }[];
  dateRange: { start: string; end: string };
  participants: string[];
}

export interface NarrativeContext {
  topYapper: string;
  ghostKing: string;
  nightOwls: string[];
  dramaCount: number;
  chaosDay: string;
  emojiSignature: string;
  totalMessages: number;
  participantCount: number;
  dateRange: { start: string; end: string };
  busiestHour: number;
  userStats: UserStats[];
  groupStats: GroupStats;
}

export interface ReportCard {
  gpa: string;
  grades: { subject: string; grade: string }[];
  principalNote: string;
  groupName: string;
}

export type IntentType = "ai" | "roast" | "corporate" | "wholesome";

export interface AIGeneratedSlides {
  intro: string;
  yapper: string;
  timeline: string;
  nightOwl: string;
  drama: string;
  finalRoast: string;
  reportCard: ReportCard;
}

export interface TemplateSlides {
  intro: (ctx: NarrativeContext) => string;
  yapper: (ctx: NarrativeContext) => string;
  timeline: (ctx: NarrativeContext) => string;
  nightOwl: (ctx: NarrativeContext) => string;
  drama: (ctx: NarrativeContext) => string;
  finalRoast: (ctx: NarrativeContext) => string;
  reportCard: (ctx: NarrativeContext) => ReportCard;
}

export interface Template {
  id: IntentType;
  tone: string;
  slides: TemplateSlides;
}
