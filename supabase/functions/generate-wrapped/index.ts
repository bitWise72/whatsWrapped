import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Models to try in order (primary + fallbacks)
const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5-nano",
];

interface SlideContent {
  intro: string;
  yapper: string;
  timeline: string;
  nightOwl: string;
  drama: string;
  finalRoast: string;
  reportCard: {
    gpa: string;
    grades: { subject: string; grade: string }[];
    principalNote: string;
    groupName: string;
  };
}

interface ChatContext {
  topTopics: string[];
  commonPhrases: string[];
  sampleMessages: string[];
  conversationPatterns: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { narrativeContext, chatContext } = await req.json();
    const API_KEY = Deno.env.get('AI_API_KEY');
    
    if (!API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    // Build rich context for the AI
    const context: ChatContext = chatContext || { 
      topTopics: [], 
      commonPhrases: [], 
      sampleMessages: [],
      conversationPatterns: []
    };

    // Extract stats summary
    const summary = {
      totalMessages: narrativeContext.totalMessages,
      participantCount: narrativeContext.participantCount,
      topYapper: narrativeContext.topYapper,
      ghostKing: narrativeContext.ghostKing,
      nightOwls: narrativeContext.nightOwls,
      dramaCount: narrativeContext.dramaCount,
      chaosDay: narrativeContext.chaosDay,
      emojiSignature: narrativeContext.emojiSignature,
      dateRange: narrativeContext.dateRange,
      busiestHour: narrativeContext.groupStats?.busiestHour,
      topUsers: narrativeContext.userStats?.slice(0, 5).map((u: any) => ({
        name: u.name,
        messageCount: u.messageCount,
        mediaCount: u.mediaCount,
        yapIndex: u.yapIndex?.toFixed(2),
        capsRatio: (u.capsRatio * 100).toFixed(1) + '%',
        nightOwlRatio: (u.nightOwlRatio * 100).toFixed(1) + '%',
        topEmojis: u.topEmojis?.slice(0, 3),
      })),
    };

    const systemPrompt = `You are a highly creative AI that generates personalized, context-aware Spotify Wrapped-style content for WhatsApp group chats.

YOUR APPROACH:
1. UNDERSTAND THE GROUP: Analyze the topics they discuss, their inside jokes, the sample messages, and their communication style
2. BE SPECIFIC: Reference actual topics, phrases, and patterns from their chat - don't be generic!
3. PERSONALIZE DEEPLY: Each slide should feel like it was written by someone who actually knows this group
4. ADAPT YOUR TONE: Based on the chat vibe - if they're formal, be witty-formal; if they're chaotic, embrace the chaos
5. CREATE CALLBACKS: Reference specific topics or phrases they use

RULES:
- Maximum 2 sentences per slide
- Use the actual topics and phrases from their chat in creative ways
- Mention specific names with their actual stats
- Create inside-joke energy based on their conversation patterns
- Be clever, not just random
- Report card subjects should reflect what THIS group actually does/discusses`;

    const userPrompt = `Generate a HIGHLY PERSONALIZED WhatsApp Wrapped for this group:

=== CHAT ANALYTICS ===
${JSON.stringify(summary, null, 2)}

=== WHAT THEY TALK ABOUT ===
Top Topics: ${context.topTopics.join(', ') || 'General chat'}
Common Phrases: ${context.commonPhrases.join(', ') || 'Various'}
Conversation Patterns: ${context.conversationPatterns.join(', ') || 'Mixed'}

=== SAMPLE MESSAGES FROM THE CHAT ===
${context.sampleMessages.slice(0, 5).map((m, i) => `${i + 1}. "${m}"`).join('\n') || 'No samples available'}

=== YOUR TASK ===
Create content that shows you UNDERSTAND this specific group. Reference their topics, adapt to their vibe.

Return JSON:
{
  "intro": "Opening that references their group dynamics or topics they discuss",
  "yapper": "Personalized roast for ${summary.topYapper} - be creative with their stats and maybe reference what they likely talk about",
  "timeline": "Make ${summary.chaosDay} memorable by connecting it to their conversation style or topics",
  "nightOwl": "Creative take on ${summary.nightOwls?.join(', ') || 'the quiet ones'} based on the group vibe",
  "drama": "Connect the ${summary.dramaCount} drama moments to what they actually discuss",
  "finalRoast": "Epic group roast that ties together their topics, patterns, and personalities",
  "reportCard": {
    "gpa": "X.X",
    "grades": [
      {"subject": "Subject based on their ACTUAL chat topics", "grade": "A-F"},
      {"subject": "Another topic-relevant subject", "grade": "A-F"},
      {"subject": "Based on their communication style", "grade": "A-F"},
      {"subject": "Reference something from their chats", "grade": "A-F"},
      {"subject": "Final creative subject", "grade": "A-F"}
    ],
    "principalNote": "Note that references their chat topics or inside jokes",
    "groupName": "Creative certificate name based on what they actually discuss"
  }
}

REMEMBER: Be specific to THIS group. If they discuss exams, reference exams. If they share memes, reference that. Make it feel personal!

Return ONLY valid JSON.`;

    let result: SlideContent | null = null;
    let lastError: Error | null = null;

    // Try each model in order
    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`Rate limited on ${model}, trying next...`);
            continue;
          }
          if (response.status === 402) {
            throw new Error("Payment required - please ensure your AI service is properly configured");
          }
          const errorText = await response.text();
          console.error(`Model ${model} error:`, response.status, errorText);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          console.log(`No content from ${model}, trying next...`);
          continue;
        }

        // Parse the JSON response
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        result = JSON.parse(cleanedContent);
        console.log(`Successfully generated with ${model}`);
        break;
        
      } catch (modelError) {
        console.error(`Error with ${model}:`, modelError);
        lastError = modelError as Error;
        continue;
      }
    }

    if (!result) {
      // Return a context-aware fallback response if all models fail
      console.log("All models failed, using context-aware fallback");
      result = generateContextAwareFallback(summary, context);
    }

    return new Response(JSON.stringify({ slides: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-wrapped:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateContextAwareFallback(summary: any, context: ChatContext): SlideContent {
  const yapperPercent = summary.topUsers?.[0] 
    ? Math.round((summary.topUsers[0].messageCount / summary.totalMessages) * 100)
    : 30;

  // Build topic-aware content
  const topTopic = context.topTopics[0] || 'random things';
  const secondTopic = context.topTopics[1] || 'everything';
  const hasLinks = context.conversationPatterns.includes('frequent link sharing');
  const hasQuestions = context.conversationPatterns.includes('lots of questions/discussions');

  // Customize intro based on group characteristics
  let intro = `${summary.totalMessages.toLocaleString()} messages about ${topTopic} and ${secondTopic}. This group has opinions.`;
  if (hasQuestions) {
    intro = `${summary.totalMessages.toLocaleString()} messages, half of them questions. This group thinks out loud.`;
  } else if (hasLinks) {
    intro = `${summary.totalMessages.toLocaleString()} messages and countless links. This group's browser history is concerning.`;
  }

  // Topic-aware yapper roast
  let yapperRoast = `${summary.topYapper} typed ${yapperPercent}% of all messages.`;
  if (context.topTopics.length > 0) {
    yapperRoast += ` Probably most of them about ${context.topTopics[0]}.`;
  } else {
    yapperRoast += ` Their keyboard needs therapy.`;
  }

  // Topic-aware timeline
  const chaosDate = summary.chaosDay !== 'N/A' 
    ? new Date(summary.chaosDay).toLocaleDateString() 
    : 'that one day';
  let timeline = `Peak madness: ${chaosDate}.`;
  if (context.topTopics.length > 0) {
    timeline += ` The ${context.topTopics[0]} debate went nuclear.`;
  } else {
    timeline += ` We don't talk about what happened.`;
  }

  // Night owl content
  let nightOwl = summary.nightOwls?.length > 0 
    ? `${summary.nightOwls.join(' and ')} — the 3 AM crew.`
    : `This group actually sleeps. Suspicious.`;
  if (summary.nightOwls?.length > 2) {
    nightOwl += ` Sleep is a suggestion, apparently.`;
  }

  // Drama content
  let drama = summary.dramaCount > 20 
    ? `${summary.dramaCount} ALL CAPS moments detected.`
    : `Only ${summary.dramaCount} dramatic moments.`;
  if (context.topTopics.length > 0) {
    drama += summary.dramaCount > 20 
      ? ` ${context.topTopics[0]} really triggers this group.`
      : ` ${context.topTopics[0]} keeps everyone surprisingly calm.`;
  }

  // Final roast
  let finalRoast = `${summary.participantCount} people, ${summary.totalMessages.toLocaleString()} messages.`;
  if (context.topTopics.length >= 2) {
    finalRoast += ` United by ${context.topTopics[0]} and ${context.topTopics[1]}.`;
  } else {
    finalRoast += ` Zero productivity achieved together.`;
  }

  // Topic-aware report card subjects
  const grades = [];
  if (context.topTopics.length > 0) {
    grades.push({ 
      subject: `${context.topTopics[0].charAt(0).toUpperCase() + context.topTopics[0].slice(1)} Discussion`, 
      grade: "A+" 
    });
  } else {
    grades.push({ subject: "Message Volume", grade: "A+" });
  }
  
  grades.push({ subject: "Reply Speed", grade: summary.nightOwls?.length > 2 ? "A" : "C" });
  grades.push({ subject: "Sleep Schedule", grade: summary.nightOwls?.length > 2 ? "F" : "B" });
  
  if (hasLinks) {
    grades.push({ subject: "Link Sharing", grade: "A+" });
  } else if (hasQuestions) {
    grades.push({ subject: "Asking Questions", grade: "A+" });
  } else {
    grades.push({ subject: "Staying On Topic", grade: "D" });
  }
  
  grades.push({ subject: "Touching Grass", grade: "F" });

  // Group name based on topics
  let groupName = "Group Chat Chaos Certificate";
  if (context.topTopics.length > 0) {
    groupName = `${context.topTopics[0].charAt(0).toUpperCase() + context.topTopics[0].slice(1)} Enthusiasts Club`;
  }

  return {
    intro,
    yapper: yapperRoast,
    timeline,
    nightOwl,
    drama,
    finalRoast,
    reportCard: {
      gpa: summary.dramaCount > 50 ? "1.2" : summary.dramaCount > 20 ? "2.1" : "2.8",
      grades,
      principalNote: context.topTopics.length > 0 
        ? `Too much ${context.topTopics[0]}. See me after class.`
        : "This chat is a liability. See me after class.",
      groupName,
    },
  };
}
