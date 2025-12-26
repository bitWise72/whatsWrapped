import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Zap, Heart, Briefcase, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseWhatsAppChat, validateChatFile, extractChatContext } from "@/lib/parser";
import { generateNarrativeContext } from "@/lib/analytics";
import { StoryViewer } from "@/components/StoryViewer";
import { IntentType, NarrativeContext, AIGeneratedSlides } from "@/lib/types";
import { toast } from "sonner";
import { GlitchText } from "@/components/ui/GlitchText";
import { supabase } from "@/integrations/supabase/client";

const intents: { id: IntentType; label: string; icon: React.ReactNode; description: string; highlighted?: boolean }[] = [
  {
    id: "ai",
    label: "AI Powered ✨",
    icon: <Sparkles className="w-5 h-5" />,
    description: "Custom intelligent content",
    highlighted: true,
  },
  {
    id: "roast",
    label: "Roast Mode",
    icon: <Zap className="w-5 h-5" />,
    description: "Savage, sarcastic, no mercy",
  },
  {
    id: "corporate",
    label: "Corporate",
    icon: <Briefcase className="w-5 h-5" />,
    description: "Professional buzzwords only",
  },
  {
    id: "wholesome",
    label: "Wholesome",
    icon: <Heart className="w-5 h-5" />,
    description: "Celebrating friendship",
  },
];

export default function Index() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [narrativeContext, setNarrativeContext] = useState<NarrativeContext | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentType>("ai");
  const [showStory, setShowStory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [aiSlides, setAiSlides] = useState<AIGeneratedSlides | null>(null);
  const [chatContext, setChatContext] = useState<ReturnType<typeof extractChatContext> | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);

    try {
      const isValid = await validateChatFile(file);
      if (!isValid) {
        toast.error("This doesn't look like a WhatsApp export file");
        setIsLoading(false);
        return;
      }

      const text = await file.text();
      const messages = parseWhatsAppChat(text);

      if (messages.length < 10) {
        toast.error("Not enough messages found. Make sure this is a valid WhatsApp export.");
        setIsLoading(false);
        return;
      }

      const context = generateNarrativeContext(messages);
      const extractedChatContext = extractChatContext(messages);
      setNarrativeContext(context);
      setChatContext(extractedChatContext);

      toast.success(`Analyzed ${messages.length.toLocaleString()} messages from ${context.participantCount} participants!`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process the chat file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleStartStory = async () => {
    if (!narrativeContext) return;

    // If AI intent selected, call edge function first
    if (selectedIntent === "ai") {
      setIsGeneratingAI(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-wrapped', {
          body: { narrativeContext, chatContext },
        });

        if (error) {
          console.error("AI generation error:", error);
          toast.error("AI generation failed, using fallback content");
          // Fallback to roast template
          setSelectedIntent("roast");
        } else if (data?.slides) {
          setAiSlides(data.slides);
        }
      } catch (err) {
        console.error("Edge function error:", err);
        toast.error("AI generation failed, using fallback content");
        setSelectedIntent("roast");
      } finally {
        setIsGeneratingAI(false);
      }
    }

    setShowStory(true);
  };

  const handleRestart = () => {
    setShowStory(false);
    setNarrativeContext(null);
    setAiSlides(null);
  };

  // Show story viewer when ready
  if (showStory && narrativeContext) {
    return (
      <StoryViewer
        context={narrativeContext}
        intent={selectedIntent}
        onRestart={handleRestart}
        aiSlides={aiSlides}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 rounded-full gradient-primary opacity-10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: "-10%", left: "-10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full gradient-secondary opacity-10 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{ bottom: "-5%", right: "-5%" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Logo/Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
          </motion.div>

          <GlitchText
            text="WhatsApp Wrapped"
            className="text-4xl md:text-6xl font-bold mb-4 text-gradient-primary"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground mb-12"
          >
            Turn your group chat into a Spotify Wrapped-style story
          </motion.p>

          <AnimatePresence mode="wait">
            {!narrativeContext ? (
              /* Upload area */
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <motion.div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer
                    ${isDragging 
                      ? "border-primary bg-primary/10 scale-105" 
                      : "border-border hover:border-primary/50 hover:bg-card/50"
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />

                  <motion.div
                    animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                    className="flex flex-col items-center"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                    )}
                    <p className="text-lg font-medium mb-2">
                      {isLoading ? "Analyzing your chaos..." : "Drop your chat export here"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Export from WhatsApp → More → Export chat → Without media
                    </p>
                  </motion.div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-xs text-muted-foreground"
                >
                  🔒 Your chat stays on your device. No data is uploaded anywhere.
                </motion.p>
              </motion.div>
            ) : (
              /* Intent selection */
              <motion.div
                key="intent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                    Chat Analyzed
                  </h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-primary">
                        {narrativeContext.totalMessages.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">messages</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-secondary">
                        {narrativeContext.participantCount}
                      </p>
                      <p className="text-sm text-muted-foreground">people</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-accent-foreground">
                        {narrativeContext.dramaCount}
                      </p>
                      <p className="text-sm text-muted-foreground">drama moments</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                    Choose Your Vibe
                  </h2>
                  <div className="grid gap-3">
                    {intents.map((intent) => (
                      <motion.button
                        key={intent.id}
                        onClick={() => setSelectedIntent(intent.id)}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl border transition-all text-left relative overflow-hidden
                          ${selectedIntent === intent.id 
                            ? intent.highlighted 
                              ? "border-primary bg-gradient-to-r from-primary/20 to-secondary/20 ring-2 ring-primary/50"
                              : "border-primary bg-primary/10" 
                            : intent.highlighted
                              ? "border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10"
                              : "border-border hover:border-primary/50"
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {intent.highlighted && (
                          <div className="absolute top-2 right-2 text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            NEW
                          </div>
                        )}
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          ${selectedIntent === intent.id 
                            ? "gradient-primary" 
                            : intent.highlighted 
                              ? "bg-gradient-to-br from-primary/30 to-secondary/30" 
                              : "bg-muted"
                          }
                        `}>
                          {intent.icon}
                        </div>
                        <div>
                          <p className="font-semibold">{intent.label}</p>
                          <p className="text-sm text-muted-foreground">{intent.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleStartStory}
                  disabled={isGeneratingAI}
                  className="w-full gradient-primary border-none text-lg h-14"
                >
                  {isGeneratingAI ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      />
                      AI is cooking...
                    </span>
                  ) : (
                    "Generate My Wrapped ✨"
                  )}
                </Button>

                <button
                  onClick={handleRestart}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Use a different chat
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
