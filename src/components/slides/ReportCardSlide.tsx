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
        {/* Mobile QR - shown above header on small screens */}
        <div className="md:hidden flex justify-center mb-4">
          <div className="bg-card border border-border rounded-xl p-2">
            <QRCodeSVG
              value="https://whatwrapped.vercel.app"
              size={88}
              level="H"
              includeMargin={false}
              bgColor="#0a0a0a"
              fgColor="#ffffff"
            />
          </div>
        </div>

          {/* Watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-muted-foreground">WhatsApp Wrapped</p>
          </motion.div>

          {/* QR overlay for md+ (absolute so it doesn't affect card flow) */}
          <div className="hidden md:flex absolute right-4 top-6 z-20 flex-col items-center gap-2">
            <div className="bg-card border border-border rounded-xl p-2">
              <QRCodeSVG
                value="https://whatwrapped.vercel.app"
                size={96}
                level="H"
                includeMargin={false}
                bgColor="#0a0a0a"
                fgColor="#ffffff"
              />
            </div>
            <div className="text-center max-w-[128px]">
              <p className="text-xs font-medium">Make your own WhatsApp Wrapped</p>
            </div>
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
            <p className="text-xs text-muted-foreground">WhatsApp Wrapped</p>
          </motion.div>

          {/* QR overlay inside the card so exports include it (moved to top-right) */}
          <div className="absolute right-4 top-6 z-20 flex flex-col items-center gap-2">
            <div className="bg-card border border-border rounded-xl p-2">
              <QRCodeSVG
                value="https://whatwrapped.vercel.app"
                size={96}
                level="H"
                includeMargin={false}
                bgColor="#0a0a0a"
                fgColor="#ffffff"
              />
            </div>
            <div className="text-center max-w-[128px]">
              <p className="text-xs font-medium">Make your own WhatsApp Wrapped</p>
            </div>
          </div>
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

        {/* QR was moved into the report card so exports include it */}
      </div>
    </div>
  );
}
