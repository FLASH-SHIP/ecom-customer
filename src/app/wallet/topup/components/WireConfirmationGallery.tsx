"use client";

import React, { useState } from "react";
import { ImagePreviewModal } from "./ImagePreviewModal";

export interface WireConfirmationGalleryProps {
  images?: string[];
  fallbackText?: string;
}

export function WireConfirmationGallery({
  images = [],
  fallbackText = "-",
}: WireConfirmationGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="text-muted-foreground">{fallbackText}</div>;
  }

  const MAX_VISIBLE = 3;
  const showMoreTile = images.length > 3;
  const visibleImages = images.slice(0, MAX_VISIBLE);
  const remainingCount = images.length - MAX_VISIBLE;

  const handleTileClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex(index);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {visibleImages.map((url, idx) => (
          <button
            key={url + idx}
            type="button"
            onClick={(e) => handleTileClick(idx, e)}
            className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 cursor-pointer group hover:opacity-90 transition-all focus:outline-none"
          >
            <img src={url} alt={`Wire confirmation ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}

        {/* 4th tile: +N See More */}
        {showMoreTile && (
          <button
            type="button"
            onClick={(e) => handleTileClick(3, e)}
            className="relative w-10 h-10 rounded-md overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 cursor-pointer group hover:opacity-90 transition-all focus:outline-none"
          >
            <img src={images[3]} alt="More images" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-extrabold text-lg">
              +{remainingCount}
            </div>
          </button>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={modalOpen}
        images={images}
        initialIndex={selectedIndex}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
