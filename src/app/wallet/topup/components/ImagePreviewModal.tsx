"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface ImagePreviewModalProps {
  open: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImagePreviewModal({
  open,
  images,
  initialIndex = 0,
  onClose,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, images, currentIndex]);

  if (!open || !images || images.length === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentImageUrl = images[currentIndex] || images[0];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-xs select-none"
      onClick={(e) => {
        // Prevent close on backdrop click to avoid closing accidentally
        e.stopPropagation();
      }}
    >
      {/* Top Right Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-[100000] p-2.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer outline-none focus:outline-none"
        title="Close (Esc)"
      >
        <X className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Previous Arrow Button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-6 z-[100000] p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer outline-none focus:outline-none"
          title="Previous"
        >
          <ChevronLeft className="w-8 h-8 stroke-[2.5]" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImageUrl}
          alt={`Preview ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl"
        />

        {/* Counter Badge at bottom */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold tracking-wider backdrop-blur-md">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Next Arrow Button */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-6 z-[100000] p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all cursor-pointer outline-none focus:outline-none"
          title="Next"
        >
          <ChevronRight className="w-8 h-8 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
}
