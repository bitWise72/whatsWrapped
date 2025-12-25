import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 p-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="flex-1 h-1 bg-muted rounded-full overflow-hidden"
        >
          {i < current && (
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          )}
          {i === current && (
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
