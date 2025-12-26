import { motion } from "framer-motion";
import { GlitchText } from "@/components/ui/GlitchText";

interface IntroSlideProps {
  text: string;
}

export function IntroSlide({ text }: IntroSlideProps) {
  return (
    <div className="slide-container relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(180deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
          animate={{
            backgroundPosition: ["0 0", "50px 50px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full gradient-primary opacity-20 blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ top: "10%", left: "10%" }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full gradient-secondary opacity-20 blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ bottom: "20%", right: "15%" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="text-sm font-mono uppercase tracking-widest text-primary">
            WhatsApp Wrapped
          </span>
        </motion.div>

        <GlitchText
          text="Your Year in Messages"
          className="text-5xl md:text-7xl font-bold mb-8 text-gradient-primary"
          delay={0.3}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
        >
          {text}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 flex items-center justify-center gap-2 text-muted-foreground"
        >
          <motion.span
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ↓
          </motion.span>
          <span className="text-sm">Tap to continue</span>
        </motion.div>
      </div>
    </div>
  );
}
