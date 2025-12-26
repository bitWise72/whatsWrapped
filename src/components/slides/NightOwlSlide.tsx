import { motion } from "framer-motion";

interface NightOwlSlideProps {
  title: string;
  text: string;
  nightOwls: string[];
}

export function NightOwlSlide({ title, text, nightOwls }: NightOwlSlideProps) {
  return (
    <div className="slide-container relative overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-foreground"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Moon glow */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--secondary) / 0.3) 0%, transparent 70%)",
          top: "10%",
          right: "10%",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-3xl text-center">
        {/* Moon emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-8xl mb-8"
        >
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-8"
        >
          {title}
        </motion.h2>

        {/* Main text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl md:text-3xl font-semibold leading-relaxed mb-8"
        >
          {text}
        </motion.p>

        {/* Night owl names */}
        {nightOwls.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {nightOwls.map((owl, i) => (
              <motion.span
                key={owl}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + i * 0.1, type: "spring" }}
                className="px-4 py-2 rounded-full gradient-secondary text-secondary-foreground font-medium"
              >
                🦉 {owl}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
