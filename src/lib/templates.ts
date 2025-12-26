// Narrative Template Packs - No LLM required
import { Template, NarrativeContext, ReportCard, IntentType } from "./types";

function formatDate(dateString: string): string {
  if (!dateString || dateString === "N/A") {
    return "Unknown Date";
  }
  
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return "Unknown Date";
  }
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function getGrade(score: number): string {
  if (score >= 0.9) return "A+";
  if (score >= 0.8) return "A";
  if (score >= 0.7) return "B+";
  if (score >= 0.6) return "B";
  if (score >= 0.5) return "C+";
  if (score >= 0.4) return "C";
  if (score >= 0.3) return "D";
  return "F";
}

// ============ ROAST TEMPLATE ============
const roastTemplate: Template = {
  id: "roast",
  tone: "Savage, sarcastic, brutally honest",
  slides: {
    intro: (ctx) =>
      `Brace yourself. We analyzed ${ctx.totalMessages.toLocaleString()} messages from ${ctx.participantCount} people who clearly have nothing better to do.`,

    yapper: (ctx) => {
      const yapper = ctx.userStats.find((u) => u.name === ctx.topYapper);
      const percentage = yapper
        ? Math.round((yapper.messageCount / ctx.totalMessages) * 100)
        : 0;
      return `${ctx.topYapper} sent ${percentage}% of all messages. Touch grass? Never heard of it.`;
    },

    timeline: (ctx) => {
      const chaosCount = ctx.groupStats.chaosSpikes[0]?.count || 0;
      const formattedDate = formatDate(ctx.chaosDay);
      if (formattedDate === "Unknown Date" || chaosCount === 0) {
        return `No major chaos spikes detected. Either y'all are boring, or you spread the madness evenly.`;
      }
      return `Peak chaos: ${formattedDate} with ${chaosCount} messages. Y'all really had nothing else going on that day, huh?`;
    },

    nightOwl: (ctx) => {
      if (ctx.nightOwls.length === 0) {
        return "Surprisingly, everyone here has a healthy sleep schedule. Boring.";
      }
      const owlList = ctx.nightOwls.join(", ");
      return `${owlList} ${ctx.nightOwls.length === 1 ? "is" : "are"} terminally online at 3 AM. Sleep is clearly optional.`;
    },

    drama: (ctx) => {
      if (ctx.dramaCount < 10) {
        return "Barely any drama detected. This group chat is disturbingly peaceful. Suspicious.";
      }
      return `${ctx.dramaCount} messages were ALL CAPS or ended in excessive exclamation marks. The drama is REAL!!!`;
    },

    finalRoast: (ctx) => {
      const avgMsgs = Math.round(ctx.totalMessages / ctx.participantCount);
      return `In conclusion: ${avgMsgs} messages per person on average. This chat is a productivity black hole.`;
    },

    reportCard: (ctx) => {
      const topUser = ctx.userStats[0];
      const grades: { subject: string; grade: string }[] = [
        { subject: "Touching Grass", grade: "F" },
        {
          subject: "Yapping Skills",
          grade: getGrade(topUser?.yapIndex || 0),
        },
        {
          subject: "Sleep Schedule",
          grade: ctx.nightOwls.length > 2 ? "D" : "B",
        },
        {
          subject: "Drama Creation",
          grade: ctx.dramaCount > 50 ? "A+" : ctx.dramaCount > 20 ? "B" : "C",
        },
        { subject: "Productivity", grade: "F" },
      ];

      const avgGrade =
        grades.reduce((sum, g) => {
          const gradeValue: Record<string, number> = {
            "A+": 4.3,
            A: 4.0,
            "B+": 3.3,
            B: 3.0,
            "C+": 2.3,
            C: 2.0,
            D: 1.0,
            F: 0,
          };
          return sum + (gradeValue[g.grade] || 0);
        }, 0) / grades.length;

      return {
        gpa: avgGrade.toFixed(1),
        grades,
        principalNote:
          avgGrade < 2
            ? "See me after class. We need to talk."
            : "Congratulations on your... unique achievements.",
        groupName: "Group Chat Academic Record",
      };
    },
  },
};

// ============ CORPORATE TEMPLATE ============
const corporateTemplate: Template = {
  id: "corporate",
  tone: "Professional, buzzword-heavy, passive-aggressive",
  slides: {
    intro: (ctx) =>
      `Q${Math.ceil((new Date().getMonth() + 1) / 3)} Communication Metrics: ${ctx.totalMessages.toLocaleString()} touchpoints across ${ctx.participantCount} stakeholders. Let's unpack this.`,

    yapper: (ctx) => {
      const yapper = ctx.userStats.find((u) => u.name === ctx.topYapper);
      const percentage = yapper
        ? Math.round((yapper.messageCount / ctx.totalMessages) * 100)
        : 0;
      return `${ctx.topYapper} drove ${percentage}% of engagement. Outstanding thought leadership, but perhaps consider... listening.`;
    },

    timeline: (ctx) => {
      const chaosCount = ctx.groupStats.chaosSpikes[0]?.count || 0;
      const formattedDate = formatDate(ctx.chaosDay);
      if (formattedDate === "Unknown Date" || chaosCount === 0) {
        return `Engagement metrics show consistent distribution across all periods. No peak synergy events identified.`;
      }
      return `Peak synergy achieved on ${formattedDate}: ${chaosCount} messages. The team really leaned in that day.`;
    },

    nightOwl: (ctx) => {
      if (ctx.nightOwls.length === 0) {
        return "Excellent work-life balance metrics. HR would be proud.";
      }
      const owlList = ctx.nightOwls.join(", ");
      return `${owlList} showed exceptional after-hours commitment. Perhaps we should circle back on boundaries?`;
    },

    drama: (ctx) => {
      if (ctx.dramaCount < 10) {
        return "Minimal escalations detected. This team aligns well. Almost too well.";
      }
      return `${ctx.dramaCount} high-urgency communications flagged. Let's take this offline and realign.`;
    },

    finalRoast: (ctx) => {
      return `Per our analysis, this chat shows strong engagement metrics. However, there's opportunity for improvement in focus areas.`;
    },

    reportCard: (ctx) => {
      const grades: { subject: string; grade: string }[] = [
        { subject: "Cross-functional Synergy", grade: "B+" },
        { subject: "Stakeholder Alignment", grade: "A" },
        { subject: "Resource Optimization", grade: "C" },
        { subject: "Bandwidth Management", grade: "D" },
        { subject: "Action Item Throughput", grade: "B" },
      ];

      return {
        gpa: "2.9",
        grades,
        principalNote:
          "Let's schedule a sync to discuss your growth trajectory.",
        groupName: "Performance Review Summary",
      };
    },
  },
};

// ============ WHOLESOME TEMPLATE ============
const wholesomeTemplate: Template = {
  id: "wholesome",
  tone: "Warm, supportive, celebrating friendship",
  slides: {
    intro: (ctx) => {
      const days = Math.ceil(
        (new Date(ctx.dateRange.end).getTime() -
          new Date(ctx.dateRange.start).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return `${ctx.totalMessages.toLocaleString()} moments of connection over ${days} days. That's ${ctx.participantCount} friends showing up for each other. 💚`;
    },

    yapper: (ctx) => {
      const yapper = ctx.userStats.find((u) => u.name === ctx.topYapper);
      const emoji = yapper?.topEmojis[0] || "💬";
      return `${ctx.topYapper} kept the conversation alive with their energy and ${emoji}. Every group needs their spark!`;
    },

    timeline: (ctx) => {
      const chaosCount = ctx.groupStats.chaosSpikes[0]?.count || 0;
      const formattedDate = formatDate(ctx.chaosDay);
      if (formattedDate === "Unknown Date" || chaosCount === 0) {
        return `Every day with you all is special. The joy is spread evenly throughout! ✨`;
      }
      return `Your biggest day was ${formattedDate} with ${chaosCount} messages. Must have been something special! ✨`;
    },

    nightOwl: (ctx) => {
      if (ctx.nightOwls.length === 0) {
        return "Everyone's getting their beauty sleep. Self-care is important! 🌙";
      }
      const owlList = ctx.nightOwls.join(" and ");
      return `${owlList} — always there for late-night chats when someone needs to talk. True friends. 🦉`;
    },

    drama: (ctx) => {
      if (ctx.dramaCount < 10) {
        return "This group radiates calm energy. You've created a safe space for each other. 💕";
      }
      return `${ctx.dramaCount} passionate messages detected. You care deeply about things — and each other!`;
    },

    finalRoast: (ctx) => {
      return `${ctx.participantCount} people, ${ctx.totalMessages.toLocaleString()} messages, countless memories. Here's to the friendships that matter. 🥂`;
    },

    reportCard: (ctx) => {
      const grades: { subject: string; grade: string }[] = [
        { subject: "Friendship", grade: "A+" },
        { subject: "Being There", grade: "A" },
        { subject: "Good Vibes", grade: "A+" },
        { subject: "Support System", grade: "A" },
        { subject: "Memory Making", grade: "A+" },
      ];

      return {
        gpa: "4.0",
        grades,
        principalNote: "You're doing amazing. Keep being there for each other. 💚",
        groupName: "Friendship Certificate",
      };
    },
  },
};

// AI intent doesn't use templates - it generates content via edge function
// But we need a placeholder for the type system
const aiPlaceholder: Template = {
  id: "ai" as IntentType,
  tone: "Custom intelligent content",
  slides: roastTemplate.slides, // fallback to roast if AI fails
};

export const templates: Record<IntentType, Template> = {
  ai: aiPlaceholder,
  roast: roastTemplate,
  corporate: corporateTemplate,
  wholesome: wholesomeTemplate,
};

export function getTemplate(intent: IntentType): Template {
  return templates[intent];
}
