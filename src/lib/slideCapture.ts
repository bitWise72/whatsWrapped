import { toPng } from "html-to-image";

export async function captureSlideAsPNG(slideElement: HTMLElement, slideNumber: number): Promise<void> {
  try {
    // Use html-to-image to capture the slide
    const dataUrl = await toPng(slideElement, {
      cacheBust: true,
      pixelRatio: 2, // Higher quality
    });

    // Convert to PNG and download
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `slide-${slideNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error capturing slide:", error);
    throw new Error("Failed to save slide");
  }
}
