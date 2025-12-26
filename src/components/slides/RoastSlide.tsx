import { motion } from "framer-motion";

interface RoastSlideProps {
  title: string;
  text: string;
  emoji?: string;
}

export function RoastSlide({ title, text, emoji = "" }: RoastSlideProps) {
  return (
    <div className="slide-container relative overflow-hidden">
      {/* Animated flames/emojis in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-20"
            initial={{
              x: Math.random() * 100 + "%",
              y: "110%",
            }}
            animate={{
              y: "-10%",
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear",
            }}
            style={{ left: `${10 + i * 12}%` }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, hsl(var(--background)) 70%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-10 max-w-3xl text-center">
        {/* Title with emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-7xl mb-8"
        >
          {emoji}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-8"
        >
          {title}
        </motion.h2>

        {/* Main roast text */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold leading-relaxed text-gradient-chaos"
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}
