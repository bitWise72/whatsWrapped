// WhatsApp Chat Parser - Handles real WhatsApp exports with robust edge case handling
import { ParsedMessage } from "./types";

// Multiple regex patterns to handle different WhatsApp export formats globally
const MESSAGE_PATTERNS = [
  // Format 1: DD/MM/YYYY, h:mm am/pm - Author: Message (with invisible unicode \u202f)
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2})\s*[\u202f\s]*(am|pm)\s*-\s*(.+)$/i,
  // Format 2: DD/MM/YYYY, HH:MM - Author: Message (24-hour format, no am/pm)
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2})\s*-\s*(.+)$/i,
  // Format 3: MM/DD/YYYY, h:mm AM/PM - Author: Message (US format)
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2})\s*[\u202f\s]*(AM|PM)\s*-\s*(.+)$/,
  // Format 4: [DD/MM/YYYY, h:mm:ss am/pm] Author: Message (with brackets and seconds)
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2})(?::\d{2})?\s*[\u202f\s]*(am|pm)?\]\s*(.+)$/i,
  // Format 5: DD.MM.YYYY, HH:MM - Author: Message (European with dots)
  /^(\d{1,2}\.\d{1,2}\.\d{2,4}),\s*(\d{1,2}:\d{2})\s*-\s*(.+)$/i,
  // Format 6: YYYY-MM-DD, HH:MM - Author: Message (ISO-like format)
  /^(\d{4}-\d{2}-\d{2}),\s*(\d{1,2}:\d{2})\s*-\s*(.+)$/i,
  // Format 7: DD/MM/YY, h:mm am/pm - (2-digit year)
  /^(\d{1,2}\/\d{1,2}\/\d{2}),\s*(\d{1,2}:\d{2})\s*[\u202f\s]*(am|pm)\s*-\s*(.+)$/i,
];

// System message patterns (no colon after the dash content)
const SYSTEM_PATTERNS = [
  /joined using/i,
  /left$/i,
  /left the group/i,
  /added/i,
  /removed/i,
  /changed the subject/i,
  /changed this group/i,
  /created group/i,
  /Messages and calls are end-to-end encrypted/i,
  /security code changed/i,
  /changed the group description/i,
  /changed their phone number/i,
  /deleted this message/i,
  /This message was deleted/i,
  /You were added/i,
  /You deleted this message/i,
  /Missed voice call/i,
  /Missed video call/i,
  /^[\u200e\u200f]/i, // Left-to-right/right-to-left marks often in system messages
  /changed the group icon/i,
  /turned on disappearing messages/i,
  /turned off disappearing messages/i,
  /pinned a message/i,
  /unpinned a message/i,
  /started a call/i,
  /ended the call/i,
  /Waiting for this message/i,
];

interface ParsedDateResult {
  day: number;
  month: number;
  year: number;
  isValid: boolean;
}

function parseDateString(dateStr: string): ParsedDateResult {
  // Handle different separators: / . -
  const cleanDate = dateStr.replace(/[\.\-]/g, "/");
  const parts = cleanDate.split("/").map(s => s.trim());
  
  if (parts.length !== 3) {
    return { day: 0, month: 0, year: 0, isValid: false };
  }

  let day: number, month: number, year: number;

  // Detect format based on value ranges and position
  const [p1, p2, p3] = parts.map(Number);

  // Check for ISO format YYYY-MM-DD (year first)
  if (parts[0].length === 4 && p1 > 1900) {
    year = p1;
    month = p2;
    day = p3;
  } 
  // Standard DD/MM/YYYY or MM/DD/YYYY
  else {
    // If first part > 12, it must be day (DD/MM/YYYY)
    if (p1 > 12) {
      day = p1;
      month = p2;
      year = p3;
    }
    // If second part > 12, it must be day (MM/DD/YYYY US format)
    else if (p2 > 12) {
      month = p1;
      day = p2;
      year = p3;
    }
    // Default to DD/MM/YYYY (most common for WhatsApp)
    else {
      day = p1;
      month = p2;
      year = p3;
    }
  }

  // Handle 2-digit years
  if (year < 100) {
    year = year > 50 ? 1900 + year : 2000 + year;
  }

  // Validate ranges
  const isValid = 
    day >= 1 && day <= 31 &&
    month >= 1 && month <= 12 &&
    year >= 1990 && year <= 2100;

  return { day, month, year, isValid };
}

function parseTimeString(timeStr: string, ampm?: string): { hours: number; minutes: number; isValid: boolean } {
  const [hoursStr, minutesStr] = timeStr.split(":").map(s => s.trim());
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  // Validate basic ranges
  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return { hours: 0, minutes: 0, isValid: false };
  }

  // Handle 12-hour format with am/pm
  if (ampm) {
    const isPM = ampm.toLowerCase() === "pm";
    const isAM = ampm.toLowerCase() === "am";
    
    if (hours < 1 || hours > 12) {
      return { hours: 0, minutes: 0, isValid: false };
    }

    if (isPM && hours !== 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }
  } else {
    // 24-hour format validation
    if (hours < 0 || hours > 23) {
      return { hours: 0, minutes: 0, isValid: false };
    }
  }

  return { hours, minutes, isValid: true };
}

function parseTimestamp(dateStr: string, timeStr: string, ampm?: string): string | null {
  const dateResult = parseDateString(dateStr);
  if (!dateResult.isValid) {
    console.warn(`Invalid date: ${dateStr}`);
    return null;
  }

  const timeResult = parseTimeString(timeStr, ampm);
  if (!timeResult.isValid) {
    console.warn(`Invalid time: ${timeStr} ${ampm || ''}`);
    return null;
  }

  const { day, month, year } = dateResult;
  const { hours, minutes } = timeResult;

  // Create date and validate it's actually valid (e.g., not Feb 31)
  const date = new Date(year, month - 1, day, hours, minutes);
  
  // Check if date is valid by comparing components
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    console.warn(`Invalid calendar date: ${day}/${month}/${year}`);
    return null;
  }

  return date.toISOString();
}

function isSystemMessage(content: string): boolean {
  // Clean invisible unicode characters for checking
  const cleanContent = content.replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
  
  // System messages typically don't have a colon separating author from content
  // But be careful - some system messages might have colons in different contexts
  const colonIndex = cleanContent.indexOf(": ");
  
  // If there's a colon, check if what comes before looks like a name (not too long, no special patterns)
  if (colonIndex !== -1 && colonIndex < 50) {
    const potentialAuthor = cleanContent.substring(0, colonIndex);
    // If potential author doesn't contain typical system message keywords, it's probably a real message
    const isLikelyAuthor = !SYSTEM_PATTERNS.some(pattern => pattern.test(potentialAuthor));
    if (isLikelyAuthor) {
      return false;
    }
  }
  
  return SYSTEM_PATTERNS.some((pattern) => pattern.test(cleanContent));
}

function isMediaMessage(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return lowerContent.includes("<media omitted>") || 
         lowerContent.includes("image omitted") ||
         lowerContent.includes("video omitted") ||
         lowerContent.includes("audio omitted") ||
         lowerContent.includes("sticker omitted") ||
         lowerContent.includes("gif omitted") ||
         lowerContent.includes("document omitted") ||
         lowerContent.includes("contact card omitted") ||
         lowerContent.includes("location omitted") ||
         lowerContent.includes("<attached:") ||
         /\.(jpg|jpeg|png|gif|webp|mp4|mp3|pdf|doc|docx)\s*\(file attached\)/i.test(content);
}

function tryMatchLine(line: string): { match: RegExpMatchArray | null; hasAmPm: boolean } {
  // Clean line of invisible unicode characters at the start
  const cleanLine = line.replace(/^[\u200e\u200f\u202a-\u202e\ufeff]+/, '').trim();
  
  for (const pattern of MESSAGE_PATTERNS) {
    const match = cleanLine.match(pattern);
    if (match) {
      // Check if this pattern has am/pm (4 groups vs 3 groups after date)
      const hasAmPm = match.length >= 5 || (match[3] && /^(am|pm)$/i.test(match[3]));
      return { match, hasAmPm };
    }
  }
  return { match: null, hasAmPm: false };
}

export function parseWhatsAppChat(rawText: string): ParsedMessage[] {
  // Normalize line endings
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalizedText.split("\n");
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;
  let skippedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Try to match a new message with any of our patterns
    const { match, hasAmPm } = tryMatchLine(line);

    if (match) {
      // Save the previous message if exists and valid
      if (currentMessage && currentMessage.timestamp) {
        messages.push(currentMessage);
      }

      let dateStr: string, timeStr: string, ampm: string | undefined, rest: string;

      if (hasAmPm && match.length >= 5) {
        // Format with am/pm: [date, time, ampm, rest]
        [, dateStr, timeStr, ampm, rest] = match;
      } else if (match.length === 4) {
        // Format without am/pm: [date, time, rest] - 24h format
        [, dateStr, timeStr, rest] = match;
        ampm = undefined;
      } else {
        // Unexpected format, try to handle gracefully
        dateStr = match[1];
        timeStr = match[2];
        ampm = match[3] && /^(am|pm)$/i.test(match[3]) ? match[3] : undefined;
        rest = match[ampm ? 4 : 3] || match[match.length - 1];
      }

      const timestamp = parseTimestamp(dateStr, timeStr, ampm);

      // Skip messages with invalid timestamps
      if (!timestamp) {
        skippedLines++;
        continue;
      }

      // Check if it's a system message
      if (isSystemMessage(rest)) {
        currentMessage = {
          timestamp,
          author: "System",
          content: rest.trim(),
          type: "system",
        };
      } else {
        // Regular message - split author and content
        const colonIndex = rest.indexOf(": ");
        if (colonIndex !== -1) {
          const author = rest.substring(0, colonIndex).trim();
          const content = rest.substring(colonIndex + 2);

          // Validate author name (should be reasonable length and not empty)
          if (author.length > 0 && author.length < 100) {
            currentMessage = {
              timestamp,
              author,
              content,
              type: isMediaMessage(content) ? "media" : "message",
            };
          } else {
            // Treat as system message if author looks invalid
            currentMessage = {
              timestamp,
              author: "System",
              content: rest.trim(),
              type: "system",
            };
          }
        } else {
          // No colon found - likely a system message
          currentMessage = {
            timestamp,
            author: "System",
            content: rest.trim(),
            type: "system",
          };
        }
      }
    } else if (currentMessage) {
      // Multi-line message continuation
      currentMessage.content += "\n" + line;
    }
  }

  // Don't forget the last message
  if (currentMessage && currentMessage.timestamp) {
    messages.push(currentMessage);
  }

  if (skippedLines > 0) {
    console.log(`Parser: Skipped ${skippedLines} lines with invalid dates/times`);
  }

  return messages;
}

export function validateChatFile(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file.name.endsWith(".txt")) {
      resolve(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Multiple patterns to detect WhatsApp exports
      const patterns = [
        /\d{1,2}\/\d{1,2}\/\d{2,4}.*\d{1,2}:\d{2}/,  // Basic date and time
        /\d{1,2}\.\d{1,2}\.\d{2,4}.*\d{1,2}:\d{2}/,  // European format
        /\d{4}-\d{2}-\d{2}.*\d{1,2}:\d{2}/,         // ISO format
      ];
      const hasDateTimePattern = patterns.some(p => p.test(text));
      const hasDashSeparator = text.includes(" - ");
      resolve(hasDateTimePattern && hasDashSeparator);
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file.slice(0, 2000)); // Check first 2KB for more confidence
  });
}

// Utility to extract topics and context from messages for AI
export function extractChatContext(messages: ParsedMessage[]): {
  topTopics: string[];
  commonPhrases: string[];
  sampleMessages: string[];
  conversationPatterns: string[];
} {
  const textMessages = messages.filter(m => m.type === 'message');
  
  // Extract words for topic analysis (excluding common words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not',
    'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'i', 'me', 'my',
    'myself', 'we', 'our', 'ours', 'you', 'your', 'he', 'him', 'his', 'she', 'her',
    'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'am', 'been', 'being', 'ok', 'okay', 'yeah', 'yes',
    'no', 'lol', 'haha', 'like', 'got', 'get', 'know', 'think', 'going', 'go',
    'bhi', 'hai', 'ka', 'ki', 'ke', 'kya', 'nahi', 'toh', 'ho', 'hain', 'tha',
    'aur', 'par', 'se', 'ko', 'ne', 'mein', 'ye', 'woh', 'kuch', 'abhi', 'bas'
  ]);

  const wordCounts: Record<string, number> = {};
  const bigramCounts: Record<string, number> = {};
  
  for (const msg of textMessages) {
    const words = msg.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w) && !/^\d+$/.test(w));
    
    for (const word of words) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
    
    // Bigrams for common phrases
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    }
  }

  // Get top topics (words mentioned frequently)
  const topTopics = Object.entries(wordCounts)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  // Get common phrases
  const commonPhrases = Object.entries(bigramCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phrase]) => phrase);

  // Sample interesting messages (longer ones, with variety)
  const interestingMessages = textMessages
    .filter(m => m.content.length > 20 && m.content.length < 200)
    .filter(m => !m.content.includes('<Media omitted>'));
  
  // Get samples from different authors
  const authorSamples: Record<string, string[]> = {};
  for (const msg of interestingMessages) {
    if (!authorSamples[msg.author]) {
      authorSamples[msg.author] = [];
    }
    if (authorSamples[msg.author].length < 2) {
      authorSamples[msg.author].push(msg.content.substring(0, 100));
    }
  }
  
  const sampleMessages = Object.values(authorSamples).flat().slice(0, 10);

  // Detect conversation patterns
  const patterns: string[] = [];
  const questionCount = textMessages.filter(m => m.content.includes('?')).length;
  if (questionCount > textMessages.length * 0.2) {
    patterns.push('lots of questions/discussions');
  }
  
  const linkCount = textMessages.filter(m => /https?:\/\//.test(m.content)).length;
  if (linkCount > 20) {
    patterns.push('frequent link sharing');
  }
  
  const voiceNotePattern = textMessages.filter(m => 
    m.content.toLowerCase().includes('audio') || m.content.includes('🎤')
  ).length;
  if (voiceNotePattern > 10) {
    patterns.push('voice message users');
  }

  return {
    topTopics,
    commonPhrases,
    sampleMessages,
    conversationPatterns: patterns,
  };
}
