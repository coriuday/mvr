"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_SCALE = 0.75;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;

type CountryImageLightboxProps = {
  images: string[];
  countryName: string;
  open: boolean;
  initialIndex: number;
  onOpenChange: (open: boolean) => void;
};

export default function CountryImageLightbox({
  images,
  countryName,
  open,
  initialIndex,
  onOpenChange,
}: CountryImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setScale(1);
    }
  }, [open, initialIndex]);

  useEffect(() => {
    setScale(1);
  }, [index]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && images.length > 1) {
        setIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight" && images.length > 1) {
        setIndex((current) => (current + 1) % images.length);
      }
      if (event.key === "+" || event.key === "=") {
        setScale((current) => Math.min(MAX_SCALE, current + SCALE_STEP));
      }
      if (event.key === "-") {
        setScale((current) => Math.max(MIN_SCALE, current - SCALE_STEP));
      }
      if (event.key === "0") {
        setScale(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, images.length]);

  if (!images.length) return null;

  const current = images[index];
  const zoomIn = () => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
  const zoomOut = () => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/80 supports-backdrop-filter:backdrop-blur-sm"
        className={cn(
          "!fixed !inset-0 !top-0 !left-0 !right-0 !bottom-0",
          "!h-dvh !w-screen !max-w-none sm:!max-w-none",
          "!translate-x-0 !translate-y-0 !transform-none",
          "flex flex-col rounded-none border-0 bg-black/95 p-4 text-white ring-0 sm:p-6",
        )}
      >
        <DialogTitle className="sr-only">
          {countryName} — image {index + 1} of {images.length}
        </DialogTitle>

        <div className="flex shrink-0 items-center justify-between gap-4 pb-3">
          <p className="text-sm text-white/70">
            Life in {countryName} · {index + 1} / {images.length}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
            aria-label="Close gallery"
          >
            <X />
          </Button>
        </div>

        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-2 z-20 text-white hover:bg-white/10 sm:left-4"
              onClick={() =>
                setIndex((current) => (current - 1 + images.length) % images.length)
              }
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6" />
            </Button>
          )}

          <div className="flex h-full w-full items-center justify-center overflow-auto px-12 sm:px-16">
            <div
              className="relative shrink-0 transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${scale})`,
                width: "min(92vw, 1100px)",
                height: "min(80vh, 860px)",
              }}
            >
              <Image
                src={current}
                alt={`${countryName} — photo ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 92vw, 1100px"
                priority
              />
            </div>
          </div>

          {images.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 z-20 text-white hover:bg-white/10 sm:right-4"
              onClick={() => setIndex((current) => (current + 1) % images.length)}
              aria-label="Next image"
            >
              <ChevronRight className="size-6" />
            </Button>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white hover:bg-white/10"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            aria-label="Zoom out"
          >
            <ZoomOut />
          </Button>
          <span className="min-w-[3.5rem] text-center text-sm text-white/70">
            {Math.round(scale * 100)}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white hover:bg-white/10"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            aria-label="Zoom in"
          >
            <ZoomIn />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-white hover:bg-white/10"
            onClick={() => setScale(1)}
            disabled={scale === 1}
            aria-label="Reset zoom"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
