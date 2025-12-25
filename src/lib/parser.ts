// WhatsApp Chat Parser - Handles real WhatsApp exports
import { ParsedMessage } from "./types";

// Regex to match WhatsApp message format
// Handles: DD/MM/YYYY, h:mm am/pm (with invisible unicode \u202f before am/pm)
const MESSAGE_REGEX = /^(\d{1,2}\/\d{1,2}\/\d{4}),\s*(\d{1,2}:\d{2})\s*[\u202f\s]*(am|pm)\s*-\s*(.+)$/i;

// System message patterns (no colon after the dash content)
const SYSTEM_PATTERNS = [
  /joined using/i,
  /left$/i,
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
];

function parseTimestamp(dateStr: string, timeStr: string, ampm: string): string {
  const [day, month, year] = dateStr.split("/").map(Number);
  let [hours, minutes] = timeStr.split(":").map(Number);

  // Convert to 24-hour format
  if (ampm.toLowerCase() === "pm" && hours !== 12) {
    hours += 12;
  } else if (ampm.toLowerCase() === "am" && hours === 12) {
    hours = 0;
  }

  const date = new Date(year, month - 1, day, hours, minutes);
  return date.toISOString();
}

function isSystemMessage(content: string): boolean {
  // System messages typically don't have a colon separating author from content
  if (content.includes(": ")) {
    return false;
  }
  return SYSTEM_PATTERNS.some((pattern) => pattern.test(content));
}

function isMediaMessage(content: string): boolean {
  return content.includes("<Media omitted>") || 
         content.includes("image omitted") ||
         content.includes("video omitted") ||
         content.includes("audio omitted") ||
         content.includes("sticker omitted") ||
         content.includes("GIF omitted") ||
         content.includes("document omitted");
}

export function parseWhatsAppChat(rawText: string): ParsedMessage[] {
  const lines = rawText.split("\n");
  const messages: ParsedMessage[] = [];
  let currentMessage: ParsedMessage | null = null;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    // Try to match a new message
    const match = line.match(MESSAGE_REGEX);

    if (match) {
      // Save the previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
      }

      const [, dateStr, timeStr, ampm, rest] = match;
      const timestamp = parseTimestamp(dateStr, timeStr, ampm);

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
          const content = rest.substring(colonIndex + 2).trim();

          currentMessage = {
            timestamp,
            author,
            content,
            type: isMediaMessage(content) ? "media" : "message",
          };
        } else {
          // Fallback for messages without clear author separation
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
  if (currentMessage) {
    messages.push(currentMessage);
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
      // Check if it looks like a WhatsApp export
      const hasDatePattern = /\d{1,2}\/\d{1,2}\/\d{4}/.test(text);
      const hasTimePattern = /\d{1,2}:\d{2}\s*[\u202f\s]*(am|pm)/i.test(text);
      resolve(hasDatePattern && hasTimePattern);
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file.slice(0, 1000)); // Just check first 1KB
  });
}
