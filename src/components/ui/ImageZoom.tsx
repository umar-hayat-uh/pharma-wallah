"use client";

import { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

interface ImageZoomProps {
    src: string;
    alt?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function ImageZoom({ src, alt, className, children }: ImageZoomProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = useCallback(() => setOpen(true), []);
    const handleClose = useCallback(() => setOpen(false), []);

    // Close on Escape key
    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, handleClose]);

    return (
        <>
            <span
                onClick={handleOpen}
                className={`cursor-zoom-in inline-block ${className ?? ""}`}
            >
                {children ? (
                    children
                ) : (
                    <img src={src} alt={alt ?? ""} className="max-w-full h-auto rounded-lg" />
                )}
            </span>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2 transition z-10"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={src}
                        alt={alt ?? ""}
                        className="max-h-[60vh] max-w-[75vw] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}