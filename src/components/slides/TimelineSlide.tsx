import { motion } from "framer-motion";
import { GroupStats } from "@/lib/types";
import { forwardRef } from "react";

interface TimelineSlideProps {
  title: string;
  text: string;
  groupStats: GroupStats;
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export const TimelineSlide = forwardRef<HTMLDivElement, TimelineSlideProps>(
  ({ title, text, groupStats }, ref) => {
    const maxSpike = Math.max(...groupStats.chaosSpikes.map((s) => s.count), 1);

  return (
    <div ref={ref} className="slide-container relative overflow-hidden">
      {/* Chaos gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: "var(--gradient-chaos)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1 }}
      />

      <div className="relative z-10 max-w-4xl w-full">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4 text-center"
        >
          {title}
        </motion.h2>

        {/* Main text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-semibold leading-relaxed text-center mb-12"
        >
          {text}
        </motion.p>

        {/* Chaos spikes visualization */}
        {groupStats.chaosSpikes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-end justify-center gap-4 h-48"
          >
            {groupStats.chaosSpikes.slice(0, 5).map((spike, i) => (
              <motion.div
                key={spike.date}
                initial={{ height: 0 }}
                animate={{ height: `${(spike.count / maxSpike) * 100}%` }}
                transition={{ delay: 0.6 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                className="w-16 md:w-20 gradient-chaos rounded-t-lg relative group"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold"
                >
                  {spike.count}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
                >
                  {new Date(spike.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Busiest hour indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 text-center"
        >
          <span className="text-muted-foreground">Peak hour: </span>
          <span className="text-primary font-bold text-lg">
            {formatHour(groupStats.busiestHour)}
          </span>
        </motion.div>
      </div>
    </div>
    );
  }
);

TimelineSlide.displayName = "TimelineSlide";
