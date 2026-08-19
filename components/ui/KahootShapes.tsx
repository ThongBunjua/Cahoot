import React from "react";
import { ShapeType } from "@/lib/realtime/types";

interface ShapeProps {
  shape?: ShapeType | number;
  className?: string;
  size?: number;
}

export function KahootShape({ shape, className = "w-6 h-6", size }: ShapeProps) {
  let resolvedShape: ShapeType = "triangle";

  if (typeof shape === "number") {
    const map: ShapeType[] = ["triangle", "diamond", "circle", "square"];
    resolvedShape = map[shape] || "triangle";
  } else if (shape) {
    resolvedShape = shape;
  }

  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  switch (resolvedShape) {
    case "triangle":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <polygon points="12,3 22,21 2,21" />
        </svg>
      );
    case "diamond":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case "circle":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "square":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          style={style}
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
    default:
      return null;
  }
}
