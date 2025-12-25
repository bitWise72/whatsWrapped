import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GradeBadgeProps {
  grade: string;
  size?: "sm" | "md" | "lg";
  delay?: number;
}

function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "gradient-primary";
  if (grade.startsWith("B")) return "gradient-accent";
  if (grade.startsWith("C")) return "gradient-secondary";
  return "bg-destructive";
}

export function GradeBadge({ grade, size = "md", delay = 0 }: GradeBadgeProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-14 h-14 text-2xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
      }}
      className={cn(
        "rounded-full flex items-center justify-center font-bold",
        getGradeColor(grade),
        sizeClasses[size]
      )}
      style={{ color: "hsl(var(--foreground))" }}
    >
      {grade}
    </motion.div>
  );
}
