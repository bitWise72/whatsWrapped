import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function GlitchText({ text, className, delay = 0 }: GlitchTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={cn("relative inline-block", className)}
    >
      <motion.span
        className="relative z-10 glitch-text"
        animate={{
          textShadow: [
            "0 0 0 hsl(var(--primary))",
            "-2px 0 0 hsl(var(--chart-2)), 2px 0 0 hsl(var(--chart-4))",
            "0 0 0 hsl(var(--primary))",
          ],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: 3,
          times: [0, 0.5, 1],
        }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
