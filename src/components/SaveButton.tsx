import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { captureSlideAsPNG } from "@/lib/slideCapture";
import { toast } from "sonner";

interface SaveButtonProps {
  slideNumber: number;
}

export function SaveButton({ slideNumber }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);

    try {
      // Find the slide container
      const slideElement = document.querySelector(".slide-container");
      if (!slideElement) {
        toast.error("Could not find slide to save");
        setIsSaving(false);
        return;
      }

      await captureSlideAsPNG(slideElement as HTMLElement, slideNumber);
      toast.success("Slide saved!");
    } catch (error) {
      console.error("Error saving slide:", error);
      toast.error("Failed to save slide");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0.6 }}
      whileHover={{ opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSave}
      disabled={isSaving}
      className="fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/60 hover:bg-green-500/80 text-white text-sm font-medium transition-all disabled:opacity-50"
      title="Save slide as PNG"
    >
      <Download className="w-4 h-4" />
      {isSaving ? "Saving..." : "Save"}
    </motion.button>
  );
}
