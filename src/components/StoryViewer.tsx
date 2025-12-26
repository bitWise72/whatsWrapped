import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NarrativeContext, IntentType, ReportCard, AIGeneratedSlides } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { IntroSlide } from "@/components/slides/IntroSlide";
import { StatSlide } from "@/components/slides/StatSlide";
import { TimelineSlide } from "@/components/slides/TimelineSlide";
import { NightOwlSlide } from "@/components/slides/NightOwlSlide";
import { DramaSlide } from "@/components/slides/DramaSlide";
import { RoastSlide } from "@/components/slides/RoastSlide";
import { ReportCardSlide } from "@/components/slides/ReportCardSlide";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface StoryViewerProps {
  context: NarrativeContext;
  intent: IntentType;
  onRestart: () => void;
  aiSlides?: AIGeneratedSlides | null;
}

type SlideType =
  | { type: "intro"; text: string }
  | { type: "yapper"; text: string }
  | { type: "timeline"; text: string }
  | { type: "nightowl"; text: string }
  | { type: "drama"; text: string }
  | { type: "roast"; text: string }
  | { type: "reportcard"; reportCard: ReportCard };

export function StoryViewer({ context, intent, onRestart, aiSlides }: StoryViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const template = getTemplate(intent === "ai" ? "roast" : intent); // fallback template for AI

  // Generate slides - use AI content if available, otherwise use template
  const slides: SlideType[] = aiSlides
    ? [
        { type: "intro", text: aiSlides.intro },
        { type: "yapper", text: aiSlides.yapper },
        { type: "timeline", text: aiSlides.timeline },
        { type: "nightowl", text: aiSlides.nightOwl },
        { type: "drama", text: aiSlides.drama },
        { type: "roast", text: aiSlides.finalRoast },
        { type: "reportcard", reportCard: aiSlides.reportCard },
      ]
    : [
        { type: "intro", text: template.slides.intro(context) },
        { type: "yapper", text: template.slides.yapper(context) },
        { type: "timeline", text: template.slides.timeline(context) },
        { type: "nightowl", text: template.slides.nightOwl(context) },
        { type: "drama", text: template.slides.drama(context) },
        { type: "roast", text: template.slides.finalRoast(context) },
        { type: "reportcard", reportCard: template.slides.reportCard(context) },
      ];

  const handleDownload = async () => {
    if (!slideRef.current) return;
    try {
      const dataUrl = await toPng(slideRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = `whatsapp-wrapped-slide-${currentSlide + 1}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Slide saved!");
    } catch (err) {
      toast.error("Failed to save image");
    }
  };

  const handleShare = async () => {
    if (!slideRef.current) return;
    try {
      const dataUrl = await toPng(slideRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `whatsapp-wrapped-slide-${currentSlide + 1}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My WhatsApp Wrapped",
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      toast.error("Failed to share");
    }
  };

  const goToNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape") {
        onRestart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, onRestart]);

  // Touch handling
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    setTouchStart(null);
  };

  const renderSlide = (slide: SlideType) => {
    switch (slide.type) {
      case "intro":
        return <IntroSlide text={slide.text} ref={slideRef} />;
      case "yapper":
        return (
          <StatSlide
            ref={slideRef}
            title="The Yapper"
            text={slide.text}
            stat={context.topYapper.split(" ")[0]}
            statLabel="dominated the chat"
            color="primary"
            userStats={context.userStats.find(
              (u) => u.name === context.topYapper
            )}
          />
        );
      case "timeline":
        return (
          <TimelineSlide
            ref={slideRef}
            title="Peak Chaos"
            text={slide.text}
            groupStats={context.groupStats}
          />
        );
      case "nightowl":
        return (
          <NightOwlSlide
            ref={slideRef}
            title="Night Owls"
            text={slide.text}
            nightOwls={context.nightOwls}
          />
        );
      case "drama":
        return (
          <DramaSlide
            ref={slideRef}
            title="Drama Detector"
            text={slide.text}
            dramaCount={context.dramaCount}
          />
        );
      case "roast":
        return (
          <RoastSlide
            ref={slideRef}
            title="Final Verdict"
            text={slide.text}
            emoji={intent === "ai" ? "" : intent === "wholesome" ? "" : intent === "corporate" ? "" : ""}
          />
        );
      case "reportcard":
        return <ReportCardSlide ref={slideRef} reportCard={slide.reportCard} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden cursor-pointer"
      onClick={goToNext}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ProgressBar current={currentSlide} total={slides.length} />

      {/* Navigation hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-sm text-muted-foreground"
      >
        <span className="hidden md:inline">← → or click to navigate</span>
        <span className="md:hidden">Swipe or tap</span>
      </motion.div>

      {/* Save/Share buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed top-6 left-6 z-50 flex gap-2"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="gap-2 gradient-primary border-none"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </motion.div>

      {/* Restart button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          onRestart();
        }}
        className="fixed top-6 right-6 z-50 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ✕ Restart
      </motion.button>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={slideRef}
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {renderSlide(slides[currentSlide])}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
