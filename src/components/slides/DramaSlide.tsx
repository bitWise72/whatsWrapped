import { motion } from "framer-motion";
import { forwardRef } from "react";

interface DramaSlideProps {
  title: string;
  text: string;
  dramaCount: number;
}

export const DramaSlide = forwardRef<HTMLDivElement, DramaSlideProps>(
  ({ title, text, dramaCount }, ref) => {
    const intensity = Math.min(dramaCount / 100, 1);

    return (
      <div ref={ref} className="slide-container relative overflow-hidden">
      {/* Dramatic background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, hsl(var(--destructive) / ${
            0.1 + intensity * 0.2
          }) 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Lightning effects */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 bg-accent"
          style={{
            height: "40%",
            left: `${20 + i * 30}%`,
            top: 0,
            transformOrigin: "top",
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: 3 + i * 1.5,
            delay: i * 0.5,
          }}
        />
      ))}

      <div className="relative z-10 max-w-3xl text-center">
        {/* Drama emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="text-8xl mb-8"
        >
          🎭
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4"
        >
          {title}
        </motion.h2>

        {/* Drama counter */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="text-7xl md:text-8xl font-bold mb-4 text-gradient-accent"
        >
          {dramaCount}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-muted-foreground mb-8"
        >
          dramatic moments detected
        </motion.p>

        {/* Main text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-2xl md:text-3xl font-semibold leading-relaxed"
        >
          {text}
        </motion.p>

        {/* Intensity meter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12"
        >
          <p className="text-sm text-muted-foreground mb-2">Drama Intensity</p>
          <div className="h-3 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
            <motion.div
              className="h-full gradient-chaos"
              initial={{ width: 0 }}
              animate={{ width: `${intensity * 100}%` }}
              transition={{ delay: 1.4, duration: 1 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
      );
    }
  );

DramaSlide.displayName = "DramaSlide";
