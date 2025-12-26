import { motion } from "framer-motion";
import { UserStats } from "@/lib/types";

interface StatSlideProps {
  title: string;
  text: string;
  stat?: string;
  statLabel?: string;
  color?: "primary" | "secondary" | "accent";
  userStats?: UserStats;
}

const colorMap = {
  primary: "text-gradient-primary",
  secondary: "text-gradient-secondary",
  accent: "text-gradient-accent",
};

const bgMap = {
  primary: "gradient-primary",
  secondary: "gradient-secondary",
  accent: "gradient-accent",
};

export function StatSlide({
  title,
  text,
  stat,
  statLabel,
  color = "primary",
  userStats,
}: StatSlideProps) {
  return (
    <div className="slide-container relative overflow-hidden">
      {/* Background accent */}
      <motion.div
        className={`absolute w-96 h-96 rounded-full ${bgMap[color]} opacity-10 blur-3xl`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      <div className="relative z-10 max-w-3xl text-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4"
        >
          {title}
        </motion.h2>

        {/* Big stat */}
        {stat && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className={`text-8xl md:text-9xl font-bold mb-4 ${colorMap[color]}`}
          >
            {stat}
          </motion.div>
        )}

        {statLabel && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-muted-foreground mb-8"
          >
            {statLabel}
          </motion.p>
        )}

        {/* Main text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-2xl md:text-3xl font-semibold leading-relaxed"
        >
          {text}
        </motion.p>

        {/* User emojis if available */}
        {userStats && userStats.topEmojis.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 flex justify-center gap-4"
          >
            {userStats.topEmojis.map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="text-4xl"
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
