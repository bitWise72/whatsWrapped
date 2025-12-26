import React from "react";

export function Footer() {
  return (
    <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <a
        href="https://x.com/sayan42g"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-green-600/75 hover:bg-green-600/90 text-white text-sm font-medium shadow-lg backdrop-blur"
        title="Sayan on X"
      >
        <span className="text-sm">Built with ❤️ by</span>
        <span className="font-mono bg-white/10 px-2 py-0.5 rounded">Sayan (Profile)</span>
      </a>
    </footer>
  );
}

export default Footer;
