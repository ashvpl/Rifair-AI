"use client";

import { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroVideoSectionProps {
  youtubeUrl?: string;
  title?: string;
  subtitle?: string;
  posterImage?: string;
}

// Utility to extract YouTube video ID from various formats
function getYouTubeId(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

export function IntroVideoSection({
  youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Default fallback video
  title = "See Rifair AI in Action",
  subtitle = "Discover how our ethical AI engine eliminates hiring bias and delivers perfect, objective interview kits in seconds.",
  posterImage = "/corporate-woman.jpg", // Pre-existing image in public directory
}: IntroVideoSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = getYouTubeId(youtubeUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling when open
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <section className="py-16 lg:py-24 px-6 lg:px-12 relative overflow-hidden bg-white border-t border-black/[0.05]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EF4444] bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
              Introductory Video
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl lg:text-5xl font-black text-[#1D1D1F] tracking-tight mt-3"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#86868B] text-base lg:text-lg font-medium leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Video Card Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-5xl mx-auto aspect-video rounded-[2.5rem] overflow-hidden border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] lg:shadow-[16px_16px_0px_rgba(0,0,0,1)] group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          {/* Card Image Poster with hover zoom */}
          <div className="absolute inset-0 bg-black z-0">
            <img
              src={posterImage}
              alt="Rifair AI Intro Video Poster"
              className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Premium Glassmorphic Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent z-10" />

          {/* Glowing Play Button container */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <motion.div
              className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:scale-110"
              whileHover={{ rotate: 5 }}
            >
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-70 pointer-events-none" />
              <div className="absolute -inset-4 rounded-full border border-white/20 opacity-30 animate-pulse pointer-events-none" />
              
              <Play className="h-8 w-8 md:h-12 md:w-12 text-white fill-white transition-colors duration-500 group-hover:text-black group-hover:fill-black translate-x-0.5" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Fullscreen cinematic Lightbox Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-12"
            onClick={() => setIsOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/10 transition-all duration-300 z-50 flex items-center justify-center hover:scale-110"
              aria-label="Close video"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Player Modal Content */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] bg-black"
              onClick={(e) => e.stopPropagation()} // Prevent close on clicking video itself
            >
              {videoId ? (
                <iframe
                  ref={iframeRef}
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  className="w-full h-full absolute inset-0 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-white/50 font-bold">
                  Invalid YouTube Link
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
