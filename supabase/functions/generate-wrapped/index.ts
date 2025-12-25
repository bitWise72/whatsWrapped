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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { narrativeContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Extract only important info to minimize tokens
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
      topUsers: narrativeContext.userStats?.slice(0, 3).map((u: any) => ({
        name: u.name,
        messageCount: u.messageCount,
        yapIndex: u.yapIndex?.toFixed(2),
        topEmojis: u.topEmojis?.slice(0, 2),
      })),
    };

    const systemPrompt = `You are a witty, creative AI that generates Spotify Wrapped-style content for WhatsApp group chats. 
Your task is to create entertaining, personalized slide content based on chat analytics.
Be clever, funny, and slightly roast-y while keeping it fun and shareable.
Use the data creatively - mention specific names, stats, and patterns.
Keep each slide text punchy (1-2 sentences max).
For the report card, be creative with subjects and grades that reflect the group's behavior.`;

    const userPrompt = `Generate a custom WhatsApp Wrapped for this group chat data:

${JSON.stringify(summary, null, 2)}

Return a JSON object with these exact fields:
{
  "intro": "Opening hook about the group (mention total messages and people)",
  "yapper": "Roast about the top talker: ${summary.topYapper} (be specific with their stats)",
  "timeline": "Comment about their peak chaos day: ${summary.chaosDay}",
  "nightOwl": "Joke about night owls: ${summary.nightOwls?.join(', ') || 'none'}",
  "drama": "Comment on drama level (${summary.dramaCount} drama moments detected)",
  "finalRoast": "Epic closing roast for the whole group",
  "reportCard": {
    "gpa": "X.X (between 0.0 and 4.0)",
    "grades": [
      {"subject": "Creative subject name", "grade": "A+ to F"},
      {"subject": "Another creative subject", "grade": "A+ to F"},
      {"subject": "Third subject", "grade": "A+ to F"},
      {"subject": "Fourth subject", "grade": "A+ to F"},
      {"subject": "Fifth subject", "grade": "A+ to F"}
    ],
    "principalNote": "Funny note from the principal",
    "groupName": "Creative name for this group's certificate"
  }
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.`;

    let result: SlideContent | null = null;
    let lastError: Error | null = null;

    // Try each model in order
    for (const model of MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
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
            throw new Error("Payment required - please add credits to your Lovable AI workspace");
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
      // Return a fallback response if all models fail
      console.log("All models failed, using fallback");
      result = generateFallback(summary);
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

function generateFallback(summary: any): SlideContent {
  const yapperPercent = summary.topUsers?.[0] 
    ? Math.round((summary.topUsers[0].messageCount / summary.totalMessages) * 100)
    : 30;

  return {
    intro: `${summary.totalMessages.toLocaleString()} messages from ${summary.participantCount} people. This group has seen things.`,
    yapper: `${summary.topYapper} typed ${yapperPercent}% of all messages. Their keyboard needs therapy.`,
    timeline: `Peak madness: ${new Date(summary.chaosDay).toLocaleDateString()}. What happened that day stays in the chat.`,
    nightOwl: summary.nightOwls?.length > 0 
      ? `${summary.nightOwls.join(' and ')} — the 3 AM crew. Sleep is clearly overrated.`
      : `Surprisingly, everyone here sleeps at normal hours. Boring but healthy.`,
    drama: summary.dramaCount > 20 
      ? `${summary.dramaCount} ALL CAPS moments detected. This chat runs on pure chaos.`
      : `Only ${summary.dramaCount} dramatic outbursts. This group is suspiciously calm.`,
    finalRoast: `${summary.participantCount} people, ${summary.totalMessages.toLocaleString()} messages, zero productivity. You're all in this together.`,
    reportCard: {
      gpa: summary.dramaCount > 50 ? "1.2" : summary.dramaCount > 20 ? "2.1" : "2.8",
      grades: [
        { subject: "Time Management", grade: "F" },
        { subject: "Typing Speed", grade: "A+" },
        { subject: "Sleep Hygiene", grade: summary.nightOwls?.length > 2 ? "D" : "B" },
        { subject: "Drama Creation", grade: summary.dramaCount > 50 ? "A+" : "B" },
        { subject: "Touching Grass", grade: "F" },
      ],
      principalNote: "This chat is a liability. See me after class.",
      groupName: "Group Chat Chaos Certificate",
    },
  };
}
