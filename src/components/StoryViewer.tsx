import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NarrativeContext, IntentType, ReportCard } from "@/lib/types";
import { getTemplate } from "@/lib/templates";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { IntroSlide } from "@/components/slides/IntroSlide";
import { StatSlide } from "@/components/slides/StatSlide";
import { TimelineSlide } from "@/components/slides/TimelineSlide";
import { NightOwlSlide } from "@/components/slides/NightOwlSlide";
import { DramaSlide } from "@/components/slides/DramaSlide";
import { RoastSlide } from "@/components/slides/RoastSlide";
import { ReportCardSlide } from "@/components/slides/ReportCardSlide";

interface StoryViewerProps {
  context: NarrativeContext;
  intent: IntentType;
  onRestart: () => void;
}

type SlideType =
  | { type: "intro"; text: string }
  | { type: "yapper"; text: string }
  | { type: "timeline"; text: string }
  | { type: "nightowl"; text: string }
  | { type: "drama"; text: string }
  | { type: "roast"; text: string }
  | { type: "reportcard"; reportCard: ReportCard };

export function StoryViewer({ context, intent, onRestart }: StoryViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const template = getTemplate(intent);

  // Generate all slides
  const slides: SlideType[] = [
    { type: "intro", text: template.slides.intro(context) },
    { type: "yapper", text: template.slides.yapper(context) },
    { type: "timeline", text: template.slides.timeline(context) },
    { type: "nightowl", text: template.slides.nightOwl(context) },
    { type: "drama", text: template.slides.drama(context) },
    { type: "roast", text: template.slides.finalRoast(context) },
    { type: "reportcard", reportCard: template.slides.reportCard(context) },
  ];

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
        return <IntroSlide text={slide.text} />;
      case "yapper":
        return (
          <StatSlide
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
            title="Peak Chaos"
            text={slide.text}
            groupStats={context.groupStats}
          />
        );
      case "nightowl":
        return (
          <NightOwlSlide
            title="Night Owls"
            text={slide.text}
            nightOwls={context.nightOwls}
          />
        );
      case "drama":
        return (
          <DramaSlide
            title="Drama Detector"
            text={slide.text}
            dramaCount={context.dramaCount}
          />
        );
      case "roast":
        return (
          <RoastSlide
            title="Final Verdict"
            text={slide.text}
            emoji={intent === "wholesome" ? "💚" : intent === "corporate" ? "📊" : "🔥"}
          />
        );
      case "reportcard":
        return <ReportCardSlide reportCard={slide.reportCard} />;
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
