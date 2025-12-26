import { motion } from "framer-motion";
import { ReportCard } from "@/lib/types";
import { GradeBadge } from "@/components/ui/GradeBadge";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface ReportCardSlideProps {
  reportCard: ReportCard;
}

export function ReportCardSlide({ reportCard }: ReportCardSlideProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = "whatsapp-wrapped-report.png";
      link.href = dataUrl;
      link.click();
      toast.success("Report card saved!");
    } catch (err) {
      toast.error("Failed to save image");
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "whatsapp-wrapped.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My WhatsApp Wrapped",
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      toast.error("Failed to share");
    }
  };

  return (
    <div className="slide-container relative overflow-hidden">
      {/* Background effect */}
      <motion.div
        className="absolute inset-0 gradient-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Report card */}
        <motion.div
          ref={cardRef}
          initial={{ y: 50, opacity: 0, rotateX: 10 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-2xl"
          style={{ aspectRatio: "9/16" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl mb-4"
            >
            </motion.div>
            <h2 className="text-xl font-bold text-gradient-primary">
              {reportCard.groupName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Official Assessment
            </p>
          </div>

          {/* GPA */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-center mb-8"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Cumulative GPA
            </p>
            <div className="text-6xl font-bold text-gradient-accent">
              {reportCard.gpa}
            </div>
          </motion.div>

          {/* Grades */}
          <div className="space-y-3 mb-8">
            {reportCard.grades.map((item, i) => (
              <motion.div
                key={item.subject}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
              >
                <span className="text-sm font-medium">{item.subject}</span>
                <GradeBadge grade={item.grade} size="sm" delay={0.8 + i * 0.1} />
              </motion.div>
            ))}
          </div>

          {/* Principal's note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="border-t border-border pt-4"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Principal's Note
            </p>
            <p className="text-sm italic">{reportCard.principalNote}</p>
          </motion.div>

          {/* Watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-muted-foreground">
              WhatsApp Wrapped 2024
            </p>
          </motion.div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center gap-4 mt-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Save
          </Button>
          <Button
            size="lg"
            onClick={handleShare}
            className="gap-2 gradient-primary border-none"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="bg-card border border-border rounded-xl p-4">
            <QRCodeSVG
              value="https://whatwrapped.vercel.app"
              size={150}
              level="H"
              includeMargin={true}
              bgColor="#0a0a0a"
              fgColor="#ffffff"
            />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-sm font-medium">Make your own WhatsApp Wrapped</p>
            <p className="text-xs text-muted-foreground mt-1">
              Scan to generate your wrapped story
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
